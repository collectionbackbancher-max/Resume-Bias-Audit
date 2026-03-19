import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import OpenAI from "openai";
import multer from "multer";
import { analyzeBias, generateRewriteSuggestions } from "./bias_engine";
import { extractResumeText, ExtractionError } from "./extract";
import { cleanOCRText, parseResumeSections } from "./nlp_pipeline";

const upload = multer({ storage: multer.memoryStorage() });

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ... existing setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // ── Debug endpoint: POST /debug-scan ────────────────────────────────────────
  // Returns extraction metadata without running bias analysis or saving to DB.
  // Protected by auth; only available in development.
  app.post("/debug-scan", isAuthenticated, upload.single("file"), async (req: any, res) => {
    const start = Date.now();

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Send a multipart/form-data request with a 'file' field." });
    }

    const { originalname, mimetype, size, buffer } = req.file;

    console.log(`[debug-scan] Received: "${originalname}" | MIME: ${mimetype} | size: ${size} bytes`);

    let extractionMethod = "unknown";
    let textPreview = "";
    let fullLength = 0;
    let extractionError: string | null = null;

    try {
      const result = await extractResumeText(buffer, originalname, mimetype);
      extractionMethod = result.source;
      fullLength = result.length;
      textPreview = result.text.slice(0, 300) + (result.text.length > 300 ? "…" : "");
    } catch (err: any) {
      // Handle structured ExtractionError
      if (err instanceof ExtractionError) {
        const elapsed = Date.now() - start;
        console.warn(`[debug-scan] Extraction error: ${err.error}`);
        return res.status(400).json({
          file: { name: originalname, type: mimetype, size_bytes: size },
          error: err.error,
          suggestion: err.suggestion,
          elapsed_ms: elapsed,
        });
      }
      // Fallback for other errors
      extractionError = err.message;
      console.warn(`[debug-scan] Extraction failed: ${err.message}`);
    }

    const elapsed = Date.now() - start;
    console.log(`[debug-scan] Done in ${elapsed}ms — method: ${extractionMethod} | length: ${fullLength}`);

    // If there was a non-structured error, return it in the success response
    if (extractionError) {
      return res.status(400).json({
        file: { name: originalname, type: mimetype, size_bytes: size },
        error: extractionError,
        suggestion: "Try uploading a different file or contact support.",
        elapsed_ms: elapsed,
      });
    }

    return res.json({
      file: {
        name: originalname,
        type: mimetype,
        size_bytes: size,
      },
      extraction: {
        method: extractionMethod,
        text_preview: textPreview,
        full_length: fullLength,
        ocr_used: extractionMethod === "ocr",
        error: null,
      },
      elapsed_ms: elapsed,
    });
  });

  app.get("/api/generate-report/:id", isAuthenticated, async (req: any, res) => {
    try {
      const scanId = Number(req.params.id);
      const scan = await storage.getScan(scanId);
      
      if (!scan) {
        return res.status(404).json({ message: "Scan not found" });
      }

      if (scan.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const reportData = {
        filename: `Scan_${scanId}`,
        score: scan.biasScore,
        riskLevel: scan.riskLevel,
        analysis: scan.flags,
        timestamp: new Date(scan.createdAt || "").toLocaleString()
      };

      const outputPath = path.join("/tmp", `report_${scanId}.pdf`);
      const pythonProcess = spawn("python3", [
        path.join(process.cwd(), "server/generate_report.py"),
        JSON.stringify(reportData),
        outputPath
      ]);

      pythonProcess.on("close", (code) => {
        if (code === 0) {
          res.download(outputPath, `Scan_${scanId}_Analysis.pdf`, (err) => {
            if (err) console.error("Download error:", err);
            fs.unlinkSync(outputPath); // Clean up
          });
        } else {
          res.status(500).json({ message: "Failed to generate PDF report" });
        }
      });
    } catch (err) {
      console.error("Report generation error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/scan-resume", isAuthenticated, upload.single("file"), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let userMeta = await storage.getUserMetadata(userId);
      
      if (!userMeta) {
        userMeta = await storage.createUserMetadata({ 
          userId, 
          email: req.user.claims.email || "unknown@example.com" 
        });
      }

      // Monthly Reset Logic and Limit Check
      const now = new Date();
      const lastReset = new Date(userMeta.lastScanReset);
      let currentScans = userMeta.scansUsed;

      if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
        currentScans = 0;
      }

      const limits: Record<string, number> = {
        free: 10,
        starter: 100,
        team: 500
      };
      
      const plan = userMeta.subscriptionPlan.toLowerCase();
      const limit = limits[plan] || 10;

      if (currentScans >= limit) {
        return res.status(403).json({ 
          message: `Monthly scan limit reached for ${userMeta.subscriptionPlan} plan (${limit} scans).` 
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded.",
          suggestion: "Please select a file to upload."
        });
      }

      const { originalname, mimetype, size, buffer } = req.file;

      // Check for empty files
      if (size === 0 || buffer.length === 0) {
        return res.status(400).json({
          error: "The uploaded file is empty.",
          suggestion: "Please upload a file that contains resume content."
        });
      }

      // Extract text — handles PDF (with OCR fallback) and DOCX
      let extraction: { text: string; length: number; source: string };
      try {
        extraction = await extractResumeText(buffer, originalname, mimetype);
      } catch (extractErr: any) {
        // Check if it's our custom ExtractionError (has .error and .suggestion)
        if (extractErr.name === "ExtractionError" && extractErr.error && extractErr.suggestion) {
          console.warn(`[scan] Extraction error: ${extractErr.error}`);
          return res.status(400).json({
            error: extractErr.error,
            suggestion: extractErr.suggestion
          });
        }
        // Fallback for other errors
        console.warn(`[scan] Extraction failed: ${extractErr.message}`);
        return res.status(400).json({
          error: "Failed to extract text from file.",
          suggestion: "Try uploading a different file or paste the resume text manually."
        });
      }

      const { text: rawText, length: textLength, source: extractionSource } = extraction;
      console.log(
        `[scan] Extraction summary — source: ${extractionSource} | length: ${textLength} chars | OCR used: ${extractionSource === "ocr" ? "YES" : "NO"}`
      );

      // ── STEP 1: Store raw text immediately ──────────────────────────────────
      const scan = await storage.createScan({
        userId: req.user.claims.sub,
        filename: req.file.originalname,
        resumeText: rawText,
      });

      // ── STEP 2: Clean text (only for OCR output) + parse sections (parallel) ─
      const t0 = Date.now();
      const [cleanText, sections] = await Promise.all([
        extractionSource === "ocr" ? cleanOCRText(rawText) : Promise.resolve(rawText),
        parseResumeSections(rawText),
      ]);
      console.log(`[scan] NLP pipeline done in ${Date.now() - t0}ms`);

      // ── STEP 3: Advanced bias analysis with section context ─────────────────
      const biasResult = analyzeBias(cleanText, sections);

      // ── STEP 4: Persist full analysis ────────────────────────────────────────
      const updated = await storage.updateScanAnalysis(
        scan.id,
        biasResult.score,
        biasResult.riskLevel,
        {
          summary: biasResult.explanation,
          biasFlags: biasResult.flags.map(f => ({
            phrase: f.phrase,
            category: f.category,
            context: f.context,
            severity: f.severity,
            description: f.description,
            suggestion: f.suggestion,
            section: f.section,
          })),
          scores: biasResult.scores,
        },
        cleanText !== rawText ? cleanText : undefined,
        sections,
      );

      // ── STEP 5: Update usage counter ─────────────────────────────────────────
      try {
        await storage.incrementScanCount(req.user.claims.sub);
      } catch (e) {
        console.error("Failed to increment scan count", e);
      }

      res.json({
        score: biasResult.score,
        riskLevel: biasResult.riskLevel,
        scan_id: updated.id,
        resumeId: updated.id,
        sections,
        extraction: {
          text: rawText.slice(0, 200) + (rawText.length > 200 ? "…" : ""),
          length: textLength,
          source: extractionSource,
          ocrCleaned: extractionSource === "ocr" && cleanText !== rawText,
        },
      });
    } catch (err) {
      console.error("Scan error:", err);
      res.status(500).json({ message: "Error processing resume scan" });
    }
  });

  // Helper to normalize scan fields for frontend consumption
  function normalizeScan(scan: any) {
    return {
      ...scan,
      score: scan.biasScore ?? null,
      analysis: scan.flags ?? null,
      filename: scan.filename || "resume",
      cleanText: scan.cleanText ?? null,
      sections: scan.sections ?? null,
    };
  }

  app.get(api.resumes.list.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const items = await storage.getUserScans(userId);
      res.json(items.map(normalizeScan));
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get(api.resumes.get.path, isAuthenticated, async (req: any, res) => {
    try {
      const scan = await storage.getScan(Number(req.params.id));
      if (!scan) {
        return res.status(404).json({ message: "Not found" });
      }
      if (scan.userId !== req.user.claims.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      res.json(normalizeScan(scan));
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post(api.resumes.upload.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.resumes.upload.input.parse(req.body);
      const scan = await storage.createScan({
        userId: req.user.claims.sub,
        filename: input.filename || "resume.txt",
        resumeText: input.text,
      });
      res.status(201).json(scan);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post(api.resumes.analyze.path, isAuthenticated, async (req: any, res) => {
    try {
      const scan = await storage.getScan(Number(req.params.id));
      if (!scan) return res.status(404).json({ message: "Not found" });
      if (scan.userId !== req.user.claims.sub) return res.status(401).json({ message: "Unauthorized" });
      if (scan.biasScore !== null) return res.json(scan); // already analyzed

      // Call OpenAI to analyze bias
      const biasResult = analyzeBias(scan.resumeText);
      const suggestions = await generateRewriteSuggestions(scan.resumeText, biasResult.flags);

      const updated = await storage.updateScanAnalysis(
        scan.id,
        biasResult.score,
        biasResult.riskLevel,
        {
          summary: biasResult.explanation,
          biasFlags: biasResult.flags.map(f => ({
            category: "General",
            description: f,
            severity: "Moderate",
            suggestion: suggestions.find(s => f.includes(s.original))?.suggestion || "Consider more inclusive language"
          })),
          suggestions,
          scores: { language: biasResult.score, age: biasResult.score, name: 100 }
        }
      );

      res.json(updated);
    } catch (err) {
      console.error("AI Analysis error:", err);
      res.status(500).json({ message: "Failed to analyze resume" });
    }
  });

  // ── Bulk scan endpoint: POST /api/scan-bulk-resumes ────────────────────────
  const multiUpload = multer({ storage: multer.memoryStorage() });
  app.post("/api/scan-bulk-resumes", isAuthenticated, multiUpload.array("files", 10), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          error: "No files uploaded.",
          suggestion: "Select at least one file to upload."
        });
      }

      // ── Check plan limits ──────────────────────────────────────────────────
      let userMeta = await storage.getUserMetadata(userId);
      if (!userMeta) {
        userMeta = await storage.createUserMetadata({
          userId,
          email: req.user.claims.email || "unknown@example.com"
        });
      }

      const plan = userMeta.subscriptionPlan.toLowerCase();
      const maxFilesPerBatch = plan === "free" ? 1 : plan === "starter" ? 5 : 10;
      
      if (files.length > maxFilesPerBatch) {
        return res.status(403).json({
          error: `Your ${userMeta.subscriptionPlan} plan allows maximum ${maxFilesPerBatch} file(s) per upload.`,
          suggestion: `Please upload ${maxFilesPerBatch} file(s) or fewer.`
        });
      }

      const now = new Date();
      const lastReset = new Date(userMeta.lastScanReset);
      let currentScans = userMeta.scansUsed;
      if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
        currentScans = 0;
      }

      const limits: Record<string, number> = { free: 10, starter: 100, team: 500 };
      const limit = limits[plan] || 10;
      if (currentScans + files.length > limit) {
        return res.status(403).json({
          error: `Monthly scan limit would be exceeded. You have ${limit - currentScans} scan(s) remaining.`,
          suggestion: `You can upload ${Math.floor((limit - currentScans) / files.length)} batch(es) with ${files.length} files each.`
        });
      }

      // ── Generate batch ID and process files in parallel ────────────────────
      const batchId = `batch-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const results = await Promise.allSettled(
        files.map(async (file) => {
          const t0 = Date.now();
          try {
            // 1. Extract text
            const extraction = await extractResumeText(file.buffer, file.originalname, file.mimetype);
            const { text: rawText, source: extractionSource } = extraction;

            // 2. Clean + parse sections (parallel)
            const [cleanText, sections] = await Promise.all([
              extractionSource === "ocr" ? cleanOCRText(rawText) : Promise.resolve(rawText),
              parseResumeSections(rawText),
            ]);

            // 3. Analyze bias
            const biasResult = analyzeBias(cleanText, sections);

            // 4. Create scan record with batch ID
            const scan = await storage.createScan({
              userId,
              batchId,
              filename: file.originalname,
              resumeText: rawText,
            });

            // 5. Update analysis
            await storage.updateScanAnalysis(
              scan.id,
              biasResult.score,
              biasResult.riskLevel,
              {
                summary: biasResult.explanation,
                biasFlags: biasResult.flags.map(f => ({
                  phrase: f.phrase,
                  category: f.category,
                  context: f.context,
                  severity: f.severity,
                  description: f.description,
                  suggestion: f.suggestion,
                  section: f.section,
                })),
                scores: biasResult.scores,
              },
              cleanText !== rawText ? cleanText : undefined,
              sections,
            );

            const elapsed = Date.now() - t0;
            console.log(`[bulk] ${file.originalname}: success in ${elapsed}ms`);
            return {
              fileName: file.originalname,
              status: "success",
              scanId: scan.id,
              biasScore: biasResult.score,
              riskLevel: biasResult.riskLevel,
              summary: biasResult.explanation,
              flags: biasResult.flags,
              elapsed_ms: elapsed,
            };
          } catch (err: any) {
            const elapsed = Date.now() - t0;
            console.error(`[bulk] ${file.originalname}: error — ${err.message}`);
            return {
              fileName: file.originalname,
              status: "failed",
              error: err instanceof ExtractionError ? err.error : err.message || "Unknown error",
              suggestion: err instanceof ExtractionError ? err.suggestion : "Try a different file.",
              elapsed_ms: elapsed,
            };
          }
        })
      );

      // ── Tally results ──────────────────────────────────────────────────────
      const succeeded = results.filter(r => r.status === "fulfilled" && r.value.status === "success").length;
      const failed = results.filter(r => r.status === "rejected" || (r.status === "fulfilled" && r.value.status === "failed")).length;

      // ── Increment usage counter for successful scans ──────────────────────
      if (succeeded > 0) {
        await storage.incrementScanCount(userId, succeeded);
      }

      // ── Return structured bulk response ────────────────────────────────────
      res.json({
        batchId,
        totalFiles: files.length,
        processed: succeeded,
        failed,
        results: results.map(r => (r.status === "fulfilled" ? r.value : {
          fileName: "unknown",
          status: "failed",
          error: "Processing error",
          elapsed_ms: 0,
        })),
      });
    } catch (err) {
      console.error("Bulk scan error:", err);
      res.status(500).json({ message: "Error processing bulk resumes" });
    }
  });

  return httpServer;
}
