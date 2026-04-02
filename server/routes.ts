import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { isAuthenticated } from "./firebaseAuth";
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
  // ── Auth user endpoint ─────────────────────────────────────────────────────
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    res.json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
    });
  });

  // ── User plan endpoint ─────────────────────────────────────────────────────
  app.get("/api/user/plan", isAuthenticated, async (req: any, res) => {
    try {
      let userMeta = await storage.getUserMetadata(req.user.id);
      if (!userMeta) {
        userMeta = await storage.createUserMetadata({ 
          userId: req.user.id, 
          email: req.user.email || "unknown@example.com" 
        });
      }

      const limits: Record<string, number> = { free: 5, starter: 100, team: 500 };
      const limit = limits[userMeta.subscriptionPlan.toLowerCase()] || 5;

      const now = new Date();
      const lastReset = new Date(userMeta.lastScanReset);
      let currentScans = userMeta.scansUsed;

      // Reset scans if month changed
      if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
        currentScans = 0;
        await storage.incrementScanCount(req.user.id, 0); // This resets it
      }

      const plan = userMeta.subscriptionPlan.toLowerCase();
      const isPaid = plan === "starter" || plan === "team";
      res.json({
        plan: userMeta.subscriptionPlan,
        scans_used: currentScans,
        scans_limit: limit,
        scans_remaining: Math.max(0, limit - currentScans),
        billing_cycle_start: userMeta.lastScanReset,
        features: {
          bulk_upload: isPaid,
          max_files_per_batch: isPaid ? 10 : 1,
          pdf_download: isPaid,
          priority_processing: plan === "team",
          ats_integrations: isPaid,
        }
      });
    } catch (err) {
      console.error("Error fetching user plan:", err);
      res.status(500).json({ message: "Failed to fetch plan information" });
    }
  });

  // ── Upgrade plan endpoint (for testing/MVP) ────────────────────────────────
  app.post("/api/user/upgrade", isAuthenticated, async (req: any, res) => {
    try {
      const { plan } = req.body;
      const validPlans = ["free", "starter", "team"];
      
      if (!plan || !validPlans.includes(plan.toLowerCase())) {
        return res.status(400).json({ error: "Invalid plan. Must be one of: free, starter, team" });
      }

      let userMeta = await storage.getUserMetadata(req.user.id);
      if (!userMeta) {
        userMeta = await storage.createUserMetadata({ 
          userId: req.user.id, 
          email: req.user.email || "unknown@example.com" 
        });
      }

      // Update plan in Firestore
      const { getFirestore } = await import("./firebaseAdmin");
      const fsDb = getFirestore();
      await fsDb.collection("users").doc(req.user.id).set(
        { subscriptionPlan: plan.toLowerCase() },
        { merge: true }
      );

      res.json({
        message: `Successfully upgraded to ${plan} plan`,
        plan: plan.toLowerCase(),
      });
    } catch (err) {
      console.error("Error upgrading plan:", err);
      res.status(500).json({ message: "Failed to upgrade plan" });
    }
  });

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
      const scanId = req.params.id;
      const scan = await storage.getScan(scanId);
      
      if (!scan) {
        return res.status(404).json({ message: "Scan not found" });
      }

      if (scan.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Check user plan for PDF download access
      let userMeta = await storage.getUserMetadata(req.user.id);
      if (!userMeta) {
        userMeta = await storage.createUserMetadata({ 
          userId: req.user.id, 
          email: req.user.email || "unknown@example.com" 
        });
      }

      const plan = userMeta.subscriptionPlan.toLowerCase();
      if (plan === "free") {
        return res.status(403).json({ 
          error: "PDF downloads are not available on the Free plan",
          upgrade_required: true,
          message: "Upgrade to Starter or Team plan to download PDF reports."
        });
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
      const userId = req.user.id;
      let userMeta = await storage.getUserMetadata(userId);
      
      if (!userMeta) {
        userMeta = await storage.createUserMetadata({ 
          userId, 
          email: req.user.email || "unknown@example.com" 
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
        free: 5,
        starter: 100,
        team: 500
      };
      
      const plan = userMeta.subscriptionPlan.toLowerCase();
      const limit = limits[plan] || 5;

      if (currentScans >= limit) {
        return res.status(403).json({ 
          error: "Scan limit reached",
          message: `Monthly scan limit reached for ${userMeta.subscriptionPlan} plan (${limit} scans).`,
          upgrade_required: true,
          scans_remaining: 0
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
        userId: req.user.id,
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
        await storage.incrementScanCount(req.user.id);
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
      const userId = req.user.id;
      const items = await storage.getUserScans(userId);
      res.json(items.map(normalizeScan));
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get(api.resumes.get.path, isAuthenticated, async (req: any, res) => {
    try {
      const scan = await storage.getScan(req.params.id);
      if (!scan) {
        return res.status(404).json({ message: "Not found" });
      }
      if (scan.userId !== req.user.id) {
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
        userId: req.user.id,
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
      const scan = await storage.getScan(req.params.id);
      if (!scan) return res.status(404).json({ message: "Not found" });
      if (scan.userId !== req.user.id) return res.status(401).json({ message: "Unauthorized" });
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
            suggestion: suggestions.find(s => f.phrase?.includes(s.original))?.suggestion || "Consider more inclusive language"
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
      const userId = req.user.id;
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
          email: req.user.email || "unknown@example.com"
        });
      }

      const plan = userMeta.subscriptionPlan.toLowerCase();
      const maxFilesPerBatch = plan === "free" ? 1 : 10; // Free: 1, Starter/Team: 10
      
      if (files.length > maxFilesPerBatch) {
        return res.status(403).json({
          error: `Your ${userMeta.subscriptionPlan} plan allows maximum ${maxFilesPerBatch} file(s) per upload.`,
          upgrade_required: plan === "free",
          suggestion: `Please upload ${maxFilesPerBatch} file(s) or fewer.`
        });
      }

      const now = new Date();
      const lastReset = new Date(userMeta.lastScanReset);
      let currentScans = userMeta.scansUsed;
      if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
        currentScans = 0;
      }

      const limits: Record<string, number> = { free: 5, starter: 100, team: 500 };
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

  // ── ATS Integration Routes ─────────────────────────────────────────────────

  // Mock Greenhouse candidate data (structured for real API replacement)
  function getMockCandidates() {
    return [
      { id: "c001", name: "Alex Johnson", resume_url: "https://example.com/resumes/alex.pdf", job_title: "Software Engineer", applied_at: "2024-11-01" },
      { id: "c002", name: "Jordan Smith", resume_url: "https://example.com/resumes/jordan.pdf", job_title: "Product Manager", applied_at: "2024-11-03" },
      { id: "c003", name: "Casey Williams", resume_url: "https://example.com/resumes/casey.pdf", job_title: "Data Analyst", applied_at: "2024-11-05" },
      { id: "c004", name: "Riley Brown", resume_url: "https://example.com/resumes/riley.pdf", job_title: "UX Designer", applied_at: "2024-11-07" },
      { id: "c005", name: "Morgan Davis", resume_url: "https://example.com/resumes/morgan.pdf", job_title: "DevOps Engineer", applied_at: "2024-11-09" },
    ];
  }

  // Mock resume text per candidate (simulates downloaded PDF content)
  function getMockResumeText(candidateId: string): string {
    const texts: Record<string, string> = {
      c001: "Experienced software engineer with strong managerial skills. Aggressive problem solver who dominates in team settings. Led a team of guys on multiple successful projects. Recent MIT graduate, class of 2022.",
      c002: "Dynamic product manager with proven track record. Native English speaker. Energetic young professional eager to make his mark. Played college football which built strong leadership skills.",
      c003: "Detail-oriented data analyst. She brings meticulous attention to data quality. Graduated summa cum laude in 2019. Experienced with SQL, Python, and R. Strong communicator and collaborative team player.",
      c004: "Creative UX designer with 5+ years experience. Ninja at user research and prototyping. Digital native who grew up designing interfaces. Passionate about inclusive design principles.",
      c005: "Senior DevOps engineer with rock-solid infrastructure skills. He thrives under pressure and dominates complex deployments. 20+ years of experience. Looking for a company that values his expertise.",
    };
    return texts[candidateId] || "Professional with diverse background and strong technical skills.";
  }

  // ── ATS plan guard helper ───────────────────────────────────────────────────
  async function requireAtsPlan(req: any, res: any): Promise<boolean> {
    const meta = await storage.getUserMetadata(req.user.id);
    const plan = (meta?.subscriptionPlan || "free").toLowerCase();
    if (plan !== "starter" && plan !== "team") {
      res.status(403).json({
        message: "ATS integrations require a Starter or Team plan.",
        upgrade_required: true,
      });
      return false;
    }
    return true;
  }

  // POST /api/ats/connect — save ATS API key
  app.post("/api/ats/connect", isAuthenticated, async (req: any, res) => {
    try {
      if (!(await requireAtsPlan(req, res))) return;
      const { apiKey, provider = "greenhouse" } = req.body;
      if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length < 4) {
        return res.status(400).json({ message: "A valid API key is required." });
      }
      await storage.upsertAtsConnection({
        userId: req.user.id,
        provider,
        apiKey: apiKey.trim(),
      });
      res.json({ status: "connected", provider });
    } catch (err) {
      console.error("ATS connect error:", err);
      res.status(500).json({ message: "Failed to save ATS connection." });
    }
  });

  // DELETE /api/ats/disconnect — remove ATS connection
  app.delete("/api/ats/disconnect", isAuthenticated, async (req: any, res) => {
    try {
      if (!(await requireAtsPlan(req, res))) return;
      await storage.deleteAtsConnection(req.user.id);
      res.json({ status: "disconnected" });
    } catch (err) {
      console.error("ATS disconnect error:", err);
      res.status(500).json({ message: "Failed to disconnect ATS." });
    }
  });

  // GET /api/ats/status — check if ATS is connected
  app.get("/api/ats/status", isAuthenticated, async (req: any, res) => {
    try {
      if (!(await requireAtsPlan(req, res))) return;
      const conn = await storage.getAtsConnection(req.user.id);
      if (conn) {
        res.json({ connected: true, provider: conn.provider, connectedAt: conn.createdAt });
      } else {
        res.json({ connected: false });
      }
    } catch (err) {
      res.status(500).json({ message: "Failed to check ATS status." });
    }
  });

  // GET /api/ats/candidates — fetch candidates (mock Greenhouse, real-ready)
  app.get("/api/ats/candidates", isAuthenticated, async (req: any, res) => {
    try {
      if (!(await requireAtsPlan(req, res))) return;
      const conn = await storage.getAtsConnection(req.user.id);
      if (!conn) {
        return res.status(403).json({ message: "No ATS connected. Please connect your Greenhouse account first." });
      }

      // Real Greenhouse API call would be:
      // const response = await fetch("https://harvest.greenhouse.io/v1/candidates", {
      //   headers: { "Authorization": `Basic ${Buffer.from(conn.apiKey + ":").toString("base64")}` }
      // });
      // const data = await response.json();

      const candidates = getMockCandidates();
      res.json(candidates);
    } catch (err) {
      console.error("ATS candidates error:", err);
      res.status(500).json({ message: "Failed to fetch candidates." });
    }
  });

  // POST /api/ats/scan — run bias analysis on all ATS candidates
  app.post("/api/ats/scan", isAuthenticated, async (req: any, res) => {
    try {
      if (!(await requireAtsPlan(req, res))) return;
      const conn = await storage.getAtsConnection(req.user.id);
      if (!conn) {
        return res.status(403).json({ message: "No ATS connected." });
      }

      const candidates = getMockCandidates();

      const results = await Promise.allSettled(
        candidates.map(async (candidate) => {
          try {
            const resumeText = getMockResumeText(candidate.id);
            const analysis = analyzeBias(resumeText);
            return {
              candidate_id: candidate.id,
              name: candidate.name,
              job_title: candidate.job_title,
              bias_score: analysis.score,
              risk_level: analysis.riskLevel,
              flags: analysis.flags.map((f: any) => ({
                phrase: f.phrase || f.term,
                category: f.category,
                severity: f.severity,
                suggestion: f.suggestion,
              })),
            };
          } catch (err: any) {
            return {
              candidate_id: candidate.id,
              name: candidate.name,
              job_title: candidate.job_title,
              bias_score: null,
              risk_level: "Error",
              flags: [],
              error: err.message,
            };
          }
        })
      );

      const output = results.map((r) =>
        r.status === "fulfilled" ? r.value : { candidate_id: "unknown", name: "Unknown", bias_score: null, risk_level: "Error", flags: [] }
      );

      res.json(output);
    } catch (err) {
      console.error("ATS scan error:", err);
      res.status(500).json({ message: "Failed to scan candidates." });
    }
  });

  // ── Paddle create checkout session ─────────────────────────────────────────────
  app.post("/api/paddle/create-checkout", isAuthenticated, async (req: any, res) => {
    try {
      const { planName } = req.body;
      if (!planName || !["starter", "team"].includes(planName)) {
        return res.status(400).json({ error: "Invalid plan name" });
      }

      const priceId =
        planName === "starter"
          ? process.env.PADDLE_PRICE_ID_STARTER
          : process.env.PADDLE_PRICE_ID_TEAM;

      if (!priceId) {
        return res.status(500).json({ error: "Price ID not configured" });
      }

      const response = await fetch("https://api.paddle.com/transactions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [{ price_id: priceId, quantity: 1 }],
          customer: { email: req.user.email },
          custom_data: { userId: req.user.id },
        }),
      });

      const data = await response.json() as any;

      if (!response.ok) {
        console.error("[Paddle] Transaction creation failed:", data);
        return res.status(500).json({ error: data.error?.detail || "Failed to create checkout" });
      }

      const checkoutUrl = data.data?.checkout?.url;
      if (!checkoutUrl) {
        console.error("[Paddle] No checkout URL in response:", data);
        return res.status(500).json({ error: "No checkout URL returned" });
      }

      res.json({ url: checkoutUrl });
    } catch (err) {
      console.error("[Paddle] Create checkout error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ── Paddle webhook endpoint ─────────────────────────────────────────────────────
  app.post("/api/paddle/webhook", async (req, res) => {
    try {
      const { verifyPaddleWebhook, parsePaddleEvent, getPlanFromPriceId } = await import("./paddle");
      const { paddleStorage } = await import("./replit_integrations/paddle/storage");

      const signature = req.headers["paddle-signature"] as string;
      const body = JSON.stringify(req.body);

      if (!verifyPaddleWebhook(body, signature, process.env.PADDLE_WEBHOOK_SECRET!)) {
        console.warn("Invalid Paddle webhook signature");
        return res.status(401).json({ error: "Invalid signature" });
      }

      const event = parsePaddleEvent(req.body);

      // Helper: resolve user by userId from custom_data OR by subscriptionId lookup
      async function resolveUser(userId?: string, subscriptionId?: string): Promise<import("@shared/schema").UserMetadata | undefined> {
        if (userId) {
          const u = await storage.getUserMetadata(userId);
          if (u) return u;
        }
        if (subscriptionId) {
          const raw = await paddleStorage.getUserBySubscriptionId(subscriptionId);
          if (raw?.userId) {
            return storage.getUserMetadata(raw.userId);
          }
        }
        return undefined;
      }

      // Handle transaction.completed (new purchase)
      if (event.eventType === "transaction.completed" && event.userId) {
        const plan = getPlanFromPriceId(event.priceId!);
        if (plan && event.customerId && event.subscriptionId) {
          const existing = await storage.getUserMetadata(event.userId);
          await paddleStorage.updateUserPlan(event.userId, plan, event.subscriptionId, event.customerId);
          const fromPlan = existing?.subscriptionPlan ?? "free";
          const planRankTx: Record<string, number> = { free: 0, starter: 1, team: 2 };
          const txEventType = (planRankTx[plan] ?? 0) >= (planRankTx[fromPlan] ?? 0)
            ? "plan_upgraded"
            : "plan_downgraded";
          await storage.logBillingEvent({
            userId: event.userId,
            eventType: txEventType,
            fromPlan,
            toPlan: plan,
            subscriptionId: event.subscriptionId,
            customerId: event.customerId,
            metadata: { paddleEvent: event.eventType },
          });
          console.log(`[Paddle] User ${event.userId} changed to ${plan}`);
        }
      }

      // Handle subscription.created
      if (event.eventType === "subscription.created") {
        const plan = getPlanFromPriceId(event.priceId ?? "");
        const userId = event.userId;
        if (plan && userId && event.customerId && event.subscriptionId) {
          const existing = await storage.getUserMetadata(userId);
          await paddleStorage.updateUserPlan(userId, plan, event.subscriptionId, event.customerId);
          const fromPlan = existing?.subscriptionPlan ?? "free";
          await storage.logBillingEvent({
            userId,
            eventType: "plan_upgraded",
            fromPlan,
            toPlan: plan,
            subscriptionId: event.subscriptionId,
            customerId: event.customerId,
            metadata: { paddleEvent: event.eventType },
          });
          console.log(`[Paddle] Subscription created for ${userId}`);
        }
      }

      // Handle subscription.updated — covers plan changes AND reactivation
      if (event.eventType === "subscription.updated" && event.subscriptionId) {
        const user = await resolveUser(event.userId, event.subscriptionId);
        if (event.status === "active") {
          await paddleStorage.updateSubscriptionStatus(event.subscriptionId, "active");
          const newPlan = event.priceId ? getPlanFromPriceId(event.priceId) : null;
          if (user) {
            const fromPlan = user.subscriptionPlan;
            if (newPlan && newPlan !== fromPlan) {
              // Plan change (upgrade or downgrade)
              const planRank: Record<string, number> = { free: 0, starter: 1, team: 2 };
              const eventType = (planRank[newPlan] ?? 0) >= (planRank[fromPlan] ?? 0)
                ? "plan_upgraded"
                : "plan_downgraded";
              const effectiveCustomerId = event.customerId ?? (user.customerId || undefined);
              if (effectiveCustomerId) {
                await paddleStorage.updateUserPlan(user.userId, newPlan, event.subscriptionId, effectiveCustomerId);
              } else {
                // No customerId available — update plan fields directly so state stays consistent
                const db = (await import("./firebaseAdmin")).getFirestore();
                await db.collection("users").doc(user.userId).set(
                  { subscriptionPlan: newPlan, paddleStatus: "active" },
                  { merge: true }
                );
              }
              await storage.logBillingEvent({
                userId: user.userId,
                eventType,
                fromPlan,
                toPlan: newPlan,
                subscriptionId: event.subscriptionId,
                metadata: { paddleEvent: event.eventType },
              });
              console.log(`[Paddle] User ${user.userId} plan changed ${fromPlan} → ${newPlan}`);
            } else {
              // Reactivation (no plan change)
              await storage.logBillingEvent({
                userId: user.userId,
                eventType: "subscription_reactivated",
                fromPlan,
                toPlan: fromPlan,
                subscriptionId: event.subscriptionId,
                metadata: { paddleEvent: event.eventType },
              });
              console.log(`[Paddle] Subscription ${event.subscriptionId} reactivated`);
            }
          }
        }
      }

      // Handle subscription.canceled
      if (event.eventType === "subscription.canceled" && event.subscriptionId) {
        const user = await resolveUser(event.userId, event.subscriptionId);
        await paddleStorage.updateSubscriptionStatus(event.subscriptionId, "canceled");
        if (user) {
          await storage.logBillingEvent({
            userId: user.userId,
            eventType: "subscription_canceled",
            fromPlan: user.subscriptionPlan,
            toPlan: "free",
            subscriptionId: event.subscriptionId,
            metadata: { paddleEvent: event.eventType },
          });
        }
        console.log(`[Paddle] Subscription ${event.subscriptionId} canceled`);
      }

      // Handle transaction.payment_failed (payment failure)
      if (event.eventType === "transaction.payment_failed") {
        const user = await resolveUser(event.userId, event.subscriptionId);
        if (user) {
          await storage.logBillingEvent({
            userId: user.userId,
            eventType: "payment_failed",
            fromPlan: user.subscriptionPlan,
            toPlan: user.subscriptionPlan,
            subscriptionId: event.subscriptionId,
            customerId: event.customerId,
            metadata: {
              paddleEvent: event.eventType,
              transactionId: event.transactionId,
            },
          });
          console.log(`[Paddle] Payment failed for user ${user.userId}`);
        }
      }

      res.json({ success: true });
    } catch (err) {
      console.error("Paddle webhook error:", err);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // ── User profile endpoints ──────────────────────────────────────────────────
  app.get("/api/user/profile", isAuthenticated, async (req: any, res) => {
    try {
      let userMeta = await storage.getUserMetadata(req.user.id);
      if (!userMeta) {
        userMeta = await storage.createUserMetadata({ userId: req.user.id, email: req.user.email });
      }
      res.json({
        id: userMeta.userId,
        email: userMeta.email,
        name: userMeta.name ?? req.user.name ?? null,
        company: userMeta.company ?? null,
        role: userMeta.role ?? null,
        subscriptionPlan: userMeta.subscriptionPlan,
        createdAt: userMeta.createdAt,
      });
    } catch (err) {
      console.error("GET /api/user/profile error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/user/profile", isAuthenticated, async (req: any, res) => {
    try {
      const { updateUserProfileSchema } = await import("@shared/schema");
      const parsed = updateUserProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
      }
      const updated = await storage.updateUserProfile(req.user.id, parsed.data);
      res.json({
        id: updated.userId,
        email: updated.email,
        name: updated.name ?? null,
        company: updated.company ?? null,
        role: updated.role ?? null,
        subscriptionPlan: updated.subscriptionPlan,
      });
    } catch (err) {
      console.error("PATCH /api/user/profile error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ── Billing events history ──────────────────────────────────────────────────
  app.get("/api/user/billing-events", isAuthenticated, async (req: any, res) => {
    try {
      const events = await storage.getUserBillingEvents(req.user.id);
      res.json(events);
    } catch (err) {
      console.error("GET /api/user/billing-events error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // ── Admin plan override ─────────────────────────────────────────────────────
  app.post("/api/admin/user/:id/plan", isAuthenticated, async (req: any, res) => {
    const adminUids = (process.env.ADMIN_UIDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    if (!adminUids.includes(req.user.id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      const targetUserId = req.params.id;
      const { plan } = req.body;
      if (!["free", "starter", "team"].includes(plan)) {
        return res.status(400).json({ message: "Invalid plan. Must be free, starter, or team." });
      }

      const existing = await storage.getUserMetadata(targetUserId);
      if (!existing) {
        return res.status(404).json({ message: "User not found" });
      }

      const fromPlan = existing.subscriptionPlan;
      await (await import("./firebaseAdmin")).getFirestore()
        .collection("users")
        .doc(targetUserId)
        .update({
          subscriptionPlan: plan,
          paddleStatus: plan === "free" ? null : "active",
          updatedAt: new Date().toISOString(),
        });

      await storage.logBillingEvent({
        userId: targetUserId,
        eventType: "admin_override",
        fromPlan,
        toPlan: plan,
        metadata: { adminId: req.user.id, adminEmail: req.user.email },
      });

      console.log(`[Admin] ${req.user.email} changed user ${targetUserId} from ${fromPlan} to ${plan}`);
      res.json({ success: true, userId: targetUserId, fromPlan, toPlan: plan });
    } catch (err) {
      console.error("POST /api/admin/user/:id/plan error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  return httpServer;
}
