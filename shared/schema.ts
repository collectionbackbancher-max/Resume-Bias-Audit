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
  name?: string | null;
  company?: string | null;
  role?: string | null;
  subscriptionPlan: string;
  scansUsed: number;
  lastScanReset: string;
  subscriptionId?: string | null;
  customerId?: string | null;
  paddleStatus?: string | null;
  teamId?: string | null;
  createdAt: string;
}

export interface AtsConnection {
  id: string;
  userId: string;
  provider: string;
  apiKey: string;
  createdAt: string;
}

export interface BillingEvent {
  id: string;
  userId: string;
  eventType: "account_created" | "plan_upgraded" | "plan_downgraded" | "subscription_canceled" | "subscription_reactivated" | "payment_failed" | "admin_override";
  fromPlan: string | null;
  toPlan: string | null;
  subscriptionId?: string | null;
  customerId?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  seatsLimit: number;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string | null;
  email: string;
  role: "owner" | "admin" | "member";
  status: "active" | "invited" | "removed";
  joinedAt: string | null;
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

export const insertBillingEventSchema = z.object({
  userId: z.string(),
  eventType: z.enum([
    "account_created",
    "plan_upgraded",
    "plan_downgraded",
    "subscription_canceled",
    "subscription_reactivated",
    "payment_failed",
    "admin_override",
  ]),
  fromPlan: z.string().nullable().optional(),
  toPlan: z.string().nullable().optional(),
  subscriptionId: z.string().nullable().optional(),
  customerId: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
});

export const updateUserProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  company: z.string().max(150).optional(),
  role: z.string().max(100).optional(),
});

export const insertTeamSchema = z.object({
  name: z.string().min(1).max(100),
  ownerId: z.string(),
  seatsLimit: z.number().int().min(1).default(5),
});

export const insertTeamMemberSchema = z.object({
  teamId: z.string(),
  userId: z.string().nullable().optional(),
  email: z.string().email(),
  role: z.enum(["owner", "admin", "member"]).default("member"),
  status: z.enum(["active", "invited", "removed"]).default("invited"),
});

export type InsertScan = z.infer<typeof insertScanSchema>;
export type InsertAtsConnection = z.infer<typeof insertAtsConnectionSchema>;
export type InsertBillingEvent = z.infer<typeof insertBillingEventSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

export const insertResumeSchema = insertScanSchema;
export type Resume = Scan;
export type InsertResume = InsertScan;
