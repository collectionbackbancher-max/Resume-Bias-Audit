import { getFirestore } from "./firebaseAdmin";
import type { InsertScan, Scan, UserMetadata, AtsConnection, InsertAtsConnection } from "@shared/schema";

export interface IStorage {
  getUserScans(userId: string): Promise<Scan[]>;
  getScan(id: string): Promise<Scan | undefined>;
  createScan(scan: InsertScan): Promise<Scan>;
  createScans(scans: InsertScan[]): Promise<Scan[]>;
  updateScanAnalysis(id: string, biasScore: number, riskLevel: string, flags: any, cleanText?: string, sections?: any): Promise<Scan>;
  getUserMetadata(userId: string): Promise<UserMetadata | undefined>;
  createUserMetadata(user: { userId: string; email: string }): Promise<UserMetadata>;
  incrementScanCount(userId: string, count?: number): Promise<void>;

  getAtsConnection(userId: string): Promise<AtsConnection | undefined>;
  upsertAtsConnection(connection: InsertAtsConnection): Promise<AtsConnection>;
  deleteAtsConnection(userId: string): Promise<void>;

  getUserResumes(userId: string): Promise<Scan[]>;
  getResume(id: string): Promise<Scan | undefined>;
  createResume(resume: InsertScan): Promise<Scan>;
  updateResumeAnalysis(id: string, score: number, riskLevel: string, analysis: any, cleanText?: string, sections?: any): Promise<Scan>;
}

function docToScan(id: string, data: FirebaseFirestore.DocumentData): Scan {
  return {
    id,
    userId: data.userId,
    batchId: data.batchId ?? null,
    filename: data.filename ?? "resume",
    resumeText: data.resumeText ?? "",
    cleanText: data.cleanText ?? null,
    sections: data.sections ?? null,
    biasScore: data.biasScore ?? null,
    riskLevel: data.riskLevel ?? null,
    flags: data.flags ?? null,
    createdAt: data.createdAt ?? new Date().toISOString(),
  };
}

function docToUserMetadata(id: string, data: FirebaseFirestore.DocumentData): UserMetadata {
  return {
    id,
    userId: data.userId,
    email: data.email ?? "",
    subscriptionPlan: data.subscriptionPlan ?? "free",
    scansUsed: data.scansUsed ?? 0,
    lastScanReset: data.lastScanReset ?? new Date().toISOString(),
    subscriptionId: data.subscriptionId ?? null,
    customerId: data.customerId ?? null,
    paddleStatus: data.paddleStatus ?? null,
    createdAt: data.createdAt ?? new Date().toISOString(),
  };
}

function docToAtsConnection(id: string, data: FirebaseFirestore.DocumentData): AtsConnection {
  return {
    id,
    userId: data.userId,
    provider: data.provider ?? "greenhouse",
    apiKey: data.apiKey ?? "",
    createdAt: data.createdAt ?? new Date().toISOString(),
  };
}

export class FirestoreStorage implements IStorage {
  private get db() {
    return getFirestore();
  }

  async getUserScans(userId: string): Promise<Scan[]> {
    const snap = await this.db
      .collection("scans")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs.map((d) => docToScan(d.id, d.data()));
  }

  async getScan(id: string): Promise<Scan | undefined> {
    const doc = await this.db.collection("scans").doc(id).get();
    if (!doc.exists) return undefined;
    return docToScan(doc.id, doc.data()!);
  }

  async createScan(scan: InsertScan): Promise<Scan> {
    const now = new Date().toISOString();
    const data = { ...scan, createdAt: now };
    const ref = await this.db.collection("scans").add(data);
    return docToScan(ref.id, data);
  }

  async createScans(scanList: InsertScan[]): Promise<Scan[]> {
    if (scanList.length === 0) return [];
    return Promise.all(scanList.map((s) => this.createScan(s)));
  }

  async updateScanAnalysis(
    id: string,
    biasScore: number,
    riskLevel: string,
    flags: any,
    cleanText?: string,
    sections?: any
  ): Promise<Scan> {
    const update: Record<string, any> = { biasScore, riskLevel, flags };
    if (cleanText !== undefined) update.cleanText = cleanText;
    if (sections !== undefined) update.sections = sections;
    await this.db.collection("scans").doc(id).update(update);
    const doc = await this.db.collection("scans").doc(id).get();
    return docToScan(doc.id, doc.data()!);
  }

  async getUserMetadata(userId: string): Promise<UserMetadata | undefined> {
    const doc = await this.db.collection("users").doc(userId).get();
    if (!doc.exists) return undefined;
    return docToUserMetadata(doc.id, doc.data()!);
  }

  async createUserMetadata(user: { userId: string; email: string }): Promise<UserMetadata> {
    const now = new Date().toISOString();
    const data = {
      userId: user.userId,
      email: user.email,
      subscriptionPlan: "free",
      scansUsed: 0,
      lastScanReset: now,
      subscriptionId: null,
      customerId: null,
      paddleStatus: null,
      createdAt: now,
    };
    await this.db.collection("users").doc(user.userId).set(data, { merge: true });
    return docToUserMetadata(user.userId, data);
  }

  async incrementScanCount(userId: string, count: number = 1): Promise<void> {
    const user = await this.getUserMetadata(userId);
    if (!user) return;

    const now = new Date();
    const lastReset = new Date(user.lastScanReset);

    const isNewMonth =
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear();

    if (isNewMonth) {
      await this.db.collection("users").doc(userId).update({
        scansUsed: count,
        lastScanReset: now.toISOString(),
      });
    } else {
      await this.db
        .collection("users")
        .doc(userId)
        .update({ scansUsed: user.scansUsed + count });
    }
  }

  async getAtsConnection(userId: string): Promise<AtsConnection | undefined> {
    const doc = await this.db.collection("ats_connections").doc(userId).get();
    if (!doc.exists) return undefined;
    return docToAtsConnection(doc.id, doc.data()!);
  }

  async upsertAtsConnection(connection: InsertAtsConnection): Promise<AtsConnection> {
    const now = new Date().toISOString();
    const data = { ...connection, createdAt: now };
    await this.db
      .collection("ats_connections")
      .doc(connection.userId)
      .set(data, { merge: true });
    return docToAtsConnection(connection.userId, data);
  }

  async deleteAtsConnection(userId: string): Promise<void> {
    await this.db.collection("ats_connections").doc(userId).delete();
  }

  async getUserResumes(userId: string) { return this.getUserScans(userId); }
  async getResume(id: string) { return this.getScan(id); }
  async createResume(resume: InsertScan) { return this.createScan(resume); }
  async updateResumeAnalysis(id: string, score: number, riskLevel: string, analysis: any, cleanText?: string, sections?: any) {
    return this.updateScanAnalysis(id, score, riskLevel, analysis, cleanText, sections);
  }
}

export const storage = new FirestoreStorage();
