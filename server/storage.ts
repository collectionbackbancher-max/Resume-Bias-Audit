import { db } from "./db";
import { scans, usersMetadata, type InsertScan, type Scan, type UserMetadata } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUserScans(userId: string): Promise<Scan[]>;
  getScan(id: number): Promise<Scan | undefined>;
  createScan(scan: InsertScan): Promise<Scan>;
  updateScanAnalysis(id: number, biasScore: number, riskLevel: string, flags: any): Promise<Scan>;
  getUserMetadata(userId: string): Promise<UserMetadata | undefined>;
  createUserMetadata(user: { userId: string, email: string }): Promise<UserMetadata>;
  incrementScanCount(userId: string): Promise<void>;
  
  // Compatibility methods
  getUserResumes(userId: string): Promise<Scan[]>;
  getResume(id: number): Promise<Scan | undefined>;
  createResume(resume: InsertScan): Promise<Scan>;
  updateResumeAnalysis(id: number, score: number, riskLevel: string, analysis: any): Promise<Scan>;
}

export class DatabaseStorage implements IStorage {
  async getUserScans(userId: string): Promise<Scan[]> {
    return await db.select().from(scans).where(eq(scans.userId, userId)).orderBy(desc(scans.createdAt));
  }

  async getScan(id: number): Promise<Scan | undefined> {
    const [scan] = await db.select().from(scans).where(eq(scans.id, id));
    return scan;
  }

  async createScan(scan: InsertScan): Promise<Scan> {
    const [created] = await db.insert(scans).values(scan).returning();
    return created;
  }

  async updateScanAnalysis(id: number, biasScore: number, riskLevel: string, flags: any): Promise<Scan> {
    const [updated] = await db.update(scans)
      .set({ biasScore, riskLevel, flags })
      .where(eq(scans.id, id))
      .returning();
    return updated;
  }

  async getUserMetadata(userId: string): Promise<UserMetadata | undefined> {
    const [user] = await db.select().from(usersMetadata).where(eq(usersMetadata.userId, userId));
    return user;
  }

  async createUserMetadata(user: { userId: string, email: string }): Promise<UserMetadata> {
    const [created] = await db.insert(usersMetadata).values(user).returning();
    return created;
  }

  async incrementScanCount(userId: string): Promise<void> {
    const user = await this.getUserMetadata(userId);
    if (user) {
      await db.update(usersMetadata)
        .set({ scansUsed: user.scansUsed + 1 })
        .where(eq(usersMetadata.userId, userId));
    }
  }

  // Compatibility
  async getUserResumes(userId: string) { return this.getUserScans(userId); }
  async getResume(id: number) { return this.getScan(id); }
  async createResume(resume: InsertScan) { return this.createScan(resume); }
  async updateResumeAnalysis(id: number, score: number, riskLevel: string, analysis: any) {
    return this.updateScanAnalysis(id, score, riskLevel, analysis);
  }
}

export const storage = new DatabaseStorage();
