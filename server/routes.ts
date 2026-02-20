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
      const resumeId = Number(req.params.id);
      const resume = await storage.getResume(resumeId);
      
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }

      if (resume.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const reportData = {
        filename: resume.filename,
        score: resume.score,
        riskLevel: resume.riskLevel,
        analysis: resume.analysis,
        timestamp: new Date(resume.createdAt || "").toLocaleString()
      };

      const outputPath = path.join("/tmp", `report_${resumeId}.pdf`);
      const pythonProcess = spawn("python3", [
        path.join(process.cwd(), "server/generate_report.py"),
        JSON.stringify(reportData),
        outputPath
      ]);

      pythonProcess.on("close", (code) => {
        if (code === 0) {
          res.download(outputPath, `${resume.filename}_Analysis.pdf`, (err) => {
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

      // Store in database as a resume entry
      const resume = await storage.createResume({
        userId: req.user.claims.sub,
        filename: req.file.originalname,
        rawText: text,
      });

      // Update with scan results
      const updated = await storage.updateResumeAnalysis(
        resume.id,
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

      res.json({
        ...biasResult,
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
      const items = await storage.getUserResumes(userId);
      res.json(items);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get(api.resumes.get.path, isAuthenticated, async (req: any, res) => {
    try {
      const resume = await storage.getResume(Number(req.params.id));
      if (!resume) {
        return res.status(404).json({ message: "Not found" });
      }
      if (resume.userId !== req.user.claims.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      res.json(resume);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post(api.resumes.upload.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.resumes.upload.input.parse(req.body);
      const resume = await storage.createResume({
        userId: req.user.claims.sub,
        filename: input.filename,
        rawText: input.text,
      });
      res.status(201).json(resume);
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
      const resume = await storage.getResume(Number(req.params.id));
      if (!resume) return res.status(404).json({ message: "Not found" });
      if (resume.userId !== req.user.claims.sub) return res.status(401).json({ message: "Unauthorized" });
      if (resume.analysis) return res.json(resume); // already analyzed

      // Call OpenAI to analyze bias
      const prompt = `Analyze the following resume for bias (gender, age, race, socioeconomic, etc.).
Resume text:
${resume.rawText}

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
        model: "gpt-5.1",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const aiResult = JSON.parse(aiResponse.choices[0].message?.content || "{}");
      
      const scores = aiResult.scores || { language: aiResult.score || 0, age: aiResult.score || 0, name: aiResult.score || 0 };

      const updated = await storage.updateResumeAnalysis(
        resume.id,
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
