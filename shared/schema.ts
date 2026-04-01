import { z } from "zod";

export interface Scan {
  id: string;
  userId: string;
  batchId?: string | null;
  filename: string;
  resumeText: string;
  cleanText?: string | null;
  sections?: any;
  biasScore?: number | null;
  riskLevel?: string | null;
  flags?: any;
  createdAt: string;
}

export interface UserMetadata {
  id: string;
  userId: string;
  email: string;
  subscriptionPlan: string;
  scansUsed: number;
  lastScanReset: string;
  subscriptionId?: string | null;
  customerId?: string | null;
  paddleStatus?: string | null;
  createdAt: string;
}

export interface AtsConnection {
  id: string;
  userId: string;
  provider: string;
  apiKey: string;
  createdAt: string;
}

export const insertScanSchema = z.object({
  userId: z.string(),
  batchId: z.string().optional(),
  filename: z.string().default("resume"),
  resumeText: z.string(),
  cleanText: z.string().optional(),
  sections: z.any().optional(),
  biasScore: z.number().optional(),
  riskLevel: z.string().optional(),
  flags: z.any().optional(),
});

export const insertAtsConnectionSchema = z.object({
  userId: z.string(),
  provider: z.string().default("greenhouse"),
  apiKey: z.string(),
});

export type InsertScan = z.infer<typeof insertScanSchema>;
export type InsertAtsConnection = z.infer<typeof insertAtsConnectionSchema>;

export const insertResumeSchema = insertScanSchema;
export type Resume = Scan;
export type InsertResume = InsertScan;
