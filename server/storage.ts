import { db } from "./db";
import { resumes, type InsertResume, type Resume } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUserResumes(userId: string): Promise<Resume[]>;
  getResume(id: number): Promise<Resume | undefined>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResumeAnalysis(id: number, score: number, riskLevel: string, analysis: any): Promise<Resume>;
}

export class DatabaseStorage implements IStorage {
  async getUserResumes(userId: string): Promise<Resume[]> {
    return await db.select().from(resumes).where(eq(resumes.userId, userId)).orderBy(desc(resumes.createdAt));
  }

  async getResume(id: number): Promise<Resume | undefined> {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    return resume;
  }

  async createResume(resume: InsertResume): Promise<Resume> {
    const [created] = await db.insert(resumes).values(resume).returning();
    return created;
  }

  async updateResumeAnalysis(id: number, score: number, riskLevel: string, analysis: any): Promise<Resume> {
    const [updated] = await db.update(resumes)
      .set({ score, riskLevel, analysis })
      .where(eq(resumes.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
