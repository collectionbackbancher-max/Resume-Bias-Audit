import { pgTable, text, serial, integer, boolean, timestamp, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models to ensure they are created
export * from "./models/auth";
import { users } from "./models/auth";

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  filename: text("filename").notNull(),
  rawText: text("raw_text").notNull(),
  score: integer("score"),
  riskLevel: text("risk_level"), // "Low", "Moderate", "High"
  analysis: json("analysis").$type<{
    summary: string;
    biasFlags: { category: string; description: string; severity: "Low" | "Moderate" | "High"; suggestion: string }[];
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertResumeSchema = createInsertSchema(resumes).omit({ id: true, createdAt: true });

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;
