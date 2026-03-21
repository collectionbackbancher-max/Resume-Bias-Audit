import { db } from "./db";
import { scans, usersMetadata, atsConnections, type InsertScan, type Scan, type UserMetadata, type AtsConnection, type InsertAtsConnection } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUserScans(userId: string): Promise<Scan[]>;
  getScan(id: number): Promise<Scan | undefined>;
  createScan(scan: InsertScan): Promise<Scan>;
  createScans(scans: InsertScan[]): Promise<Scan[]>;
  updateScanAnalysis(id: number, biasScore: number, riskLevel: string, flags: any, cleanText?: string, sections?: any): Promise<Scan>;
  getUserMetadata(userId: string): Promise<UserMetadata | undefined>;
  createUserMetadata(user: { userId: string, email: string }): Promise<UserMetadata>;
  incrementScanCount(userId: string, count: number): Promise<void>;
  
  // ATS connection methods
  getAtsConnection(userId: string): Promise<AtsConnection | undefined>;
  upsertAtsConnection(connection: InsertAtsConnection): Promise<AtsConnection>;
  deleteAtsConnection(userId: string): Promise<void>;

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

  async createScans(scanList: InsertScan[]): Promise<Scan[]> {
    if (scanList.length === 0) return [];
    return await db.insert(scans).values(scanList).returning();
  }

  async updateScanAnalysis(id: number, biasScore: number, riskLevel: string, flags: any, cleanText?: string, sections?: any): Promise<Scan> {
    const [updated] = await db.update(scans)
      .set({ biasScore, riskLevel, flags, ...(cleanText !== undefined ? { cleanText } : {}), ...(sections !== undefined ? { sections } : {}) })
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

  async incrementScanCount(userId: string, count: number = 1): Promise<void> {
    const user = await this.getUserMetadata(userId);
    if (user) {
      const now = new Date();
      const lastReset = new Date(user.lastScanReset);
      
      // Check if it's a new month
      if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
        await db.update(usersMetadata)
          .set({ scansUsed: count, lastScanReset: now })
          .where(eq(usersMetadata.userId, userId));
      } else {
        await db.update(usersMetadata)
          .set({ scansUsed: user.scansUsed + count })
          .where(eq(usersMetadata.userId, userId));
      }
    }
  }

  // ATS connections
  async getAtsConnection(userId: string): Promise<AtsConnection | undefined> {
    const [conn] = await db.select().from(atsConnections).where(eq(atsConnections.userId, userId));
    return conn;
  }

  async upsertAtsConnection(connection: InsertAtsConnection): Promise<AtsConnection> {
    const existing = await this.getAtsConnection(connection.userId);
    if (existing) {
      const [updated] = await db.update(atsConnections)
        .set({ apiKey: connection.apiKey, provider: connection.provider })
        .where(eq(atsConnections.userId, connection.userId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(atsConnections).values(connection).returning();
    return created;
  }

  async deleteAtsConnection(userId: string): Promise<void> {
    await db.delete(atsConnections).where(eq(atsConnections.userId, userId));
  }

  // Compatibility
  async getUserResumes(userId: string) { return this.getUserScans(userId); }
  async getResume(id: number) { return this.getScan(id); }
  async createResume(resume: InsertScan) { return this.createScan(resume); }
  async updateResumeAnalysis(id: number, score: number, riskLevel: string, analysis: any, cleanText?: string, sections?: any) {
    return this.updateScanAnalysis(id, score, riskLevel, analysis, cleanText, sections);
  }
}

export const storage = new DatabaseStorage();
