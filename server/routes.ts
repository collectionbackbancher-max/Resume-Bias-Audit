import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import OpenAI from "openai";
import multer from "multer";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import mammoth from "mammoth";
import { analyzeBias } from "./bias_engine";

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

      let text = "";
      const buffer = req.file.buffer;

      if (req.file.mimetype === "application/pdf") {
        const data = await pdfParse(buffer);
        text = data.text;
      } else if (
        req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } else {
        return res.status(400).json({ message: "Unsupported file type. Please upload PDF or DOCX." });
      }

      if (!text || text.trim().length === 0) {
        return res.status(400).json({ message: "Could not extract text from the file." });
      }

      const biasResult = analyzeBias(text);

      // Store in database as a scan entry
      const scan = await storage.createScan({
        userId: req.user.claims.sub,
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
        resumeId: updated.id
      });
    } catch (err) {
      console.error("Scan error:", err);
      res.status(500).json({ message: "Error processing resume scan" });
    }
  });

  app.get(api.resumes.list.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const items = await storage.getUserScans(userId);
      res.json(items);
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
      res.json(scan);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post(api.resumes.upload.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.resumes.upload.input.parse(req.body);
      const scan = await storage.createScan({
        userId: req.user.claims.sub,
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
      const prompt = `Analyze the following resume for bias (gender, age, race, socioeconomic, etc.).
Resume text:
${scan.resumeText}

Respond with JSON matching this structure exactly:
{
  "score": <0-100 fairness score, 100 is perfectly unbiased>,
  "riskLevel": "<Low | Moderate | High>",
  "analysis": {
    "summary": "<overall summary>",
    "biasFlags": [
      { "category": "<type of bias>", "description": "<description>", "severity": "<Low|Moderate|High>", "suggestion": "<rewrite suggestion>" }
    ]
  }
}`;

      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const aiResult = JSON.parse(aiResponse.choices[0].message?.content || "{}");
      
      const scores = aiResult.scores || { language: aiResult.score || 0, age: aiResult.score || 0, name: aiResult.score || 0 };

      const updated = await storage.updateScanAnalysis(
        scan.id,
        aiResult.score || 0,
        aiResult.riskLevel || "Moderate",
        {
          ...(aiResult.analysis || { summary: "Analysis failed", biasFlags: [] }),
          scores
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
