import { pgTable, text, serial, integer, timestamp, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models to ensure they are created
export * from "./models/auth";
import { users as authUsers } from "./models/auth";

export const usersMetadata = pgTable("users_metadata", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => authUsers.id),
  email: text("email").notNull(),
  subscriptionPlan: text("subscription_plan").default("free").notNull(),
  scansUsed: integer("scans_used").default(0).notNull(),
  lastScanReset: timestamp("last_scan_reset").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scans = pgTable("scans", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => authUsers.id),
  resumeText: text("resume_text").notNull(),
  biasScore: integer("bias_score"),
  riskLevel: text("risk_level"),
  flags: json("flags").$type<any>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserMetadataSchema = createInsertSchema(usersMetadata).omit({ id: true, createdAt: true });
export const insertScanSchema = createInsertSchema(scans).omit({ id: true, createdAt: true });

export type UserMetadata = typeof usersMetadata.$inferSelect;
export type Scan = typeof scans.$inferSelect;
export type InsertScan = z.infer<typeof insertScanSchema>;

// Alias for existing code compatibility
export const resumes = scans;
export const insertResumeSchema = insertScanSchema;
export type Resume = Scan;
export type InsertResume = InsertScan;
