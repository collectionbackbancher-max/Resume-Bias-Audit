import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import OpenAI from "openai";
import multer from "multer";
import { analyzeBias, generateRewriteSuggestions } from "./bias_engine";
import { extractResumeText } from "./extract";

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
      extractionError = err.message;
      console.warn(`[debug-scan] Extraction failed: ${err.message}`);
    }

    const elapsed = Date.now() - start;
    console.log(`[debug-scan] Done in ${elapsed}ms — method: ${extractionMethod} | length: ${fullLength}`);

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
        error: extractionError,
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
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { originalname, mimetype, buffer } = req.file;

      // Extract text — handles PDF (with OCR fallback) and DOCX
      let extraction: { text: string; length: number; source: string };
      try {
        extraction = await extractResumeText(buffer, originalname, mimetype);
      } catch (extractErr: any) {
        console.warn(`[scan] Extraction failed: ${extractErr.message}`);
        return res.status(400).json({ message: extractErr.message });
      }

      const { text, length: textLength, source: extractionSource } = extraction;
      console.log(
        `[scan] Extraction summary — source: ${extractionSource} | length: ${textLength} chars | OCR used: ${extractionSource === "ocr" ? "YES" : "NO"}`
      );

      const biasResult = analyzeBias(text);

      // Store in database as a scan entry
      const scan = await storage.createScan({
        userId: req.user.claims.sub,
        filename: req.file.originalname,
        resumeText: text,
      });

      // Update with scan results
      const updated = await storage.updateScanAnalysis(
        scan.id,
        biasResult.score,
        biasResult.riskLevel,
        {
          summary: biasResult.explanation,
          biasFlags: biasResult.flags.map(f => ({
            category: "General",
            description: f,
            severity: biasResult.riskLevel as "Low" | "Moderate" | "High",
            suggestion: "Consider neutralizing this language."
          })),
          scores: {
            language: biasResult.score,
            age: 100,
            name: 100
          }
        }
      );

      // Update user scan count
      try {
        await storage.incrementScanCount(req.user.claims.sub);
      } catch (e) {
        console.error("Failed to increment scan count", e);
      }

      res.json({
        ...biasResult,
        scan_id: updated.id,
        resumeId: updated.id,
        extraction: {
          text: text.slice(0, 200) + (text.length > 200 ? "…" : ""), // preview only
          length: textLength,
          source: extractionSource,
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

  return httpServer;
}
