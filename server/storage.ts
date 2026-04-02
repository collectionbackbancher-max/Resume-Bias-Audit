import { getFirestore } from "./firebaseAdmin";
import type {
  InsertScan, Scan, UserMetadata, AtsConnection, InsertAtsConnection,
  BillingEvent, InsertBillingEvent, Team, InsertTeam, TeamMember, InsertTeamMember,
  UpdateUserProfile,
} from "@shared/schema";

export interface IStorage {
  getUserScans(userId: string): Promise<Scan[]>;
  getScan(id: string): Promise<Scan | undefined>;
  createScan(scan: InsertScan): Promise<Scan>;
  createScans(scans: InsertScan[]): Promise<Scan[]>;
  updateScanAnalysis(id: string, biasScore: number, riskLevel: string, flags: any, cleanText?: string, sections?: any): Promise<Scan>;

  getUserMetadata(userId: string): Promise<UserMetadata | undefined>;
  createUserMetadata(user: { userId: string; email: string; name?: string }): Promise<UserMetadata>;
  updateUserProfile(userId: string, profile: UpdateUserProfile): Promise<UserMetadata>;
  incrementScanCount(userId: string, count?: number): Promise<void>;

  getAtsConnection(userId: string): Promise<AtsConnection | undefined>;
  upsertAtsConnection(connection: InsertAtsConnection): Promise<AtsConnection>;
  deleteAtsConnection(userId: string): Promise<void>;

  logBillingEvent(event: InsertBillingEvent): Promise<BillingEvent>;
  getUserBillingEvents(userId: string): Promise<BillingEvent[]>;

  createTeam(team: InsertTeam): Promise<Team>;
  getTeamByOwner(ownerId: string): Promise<Team | undefined>;
  getTeam(teamId: string): Promise<Team | undefined>;
  addTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  getTeamMembers(teamId: string): Promise<TeamMember[]>;
  removeTeamMember(teamId: string, userId: string): Promise<void>;

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
    name: data.name ?? null,
    company: data.company ?? null,
    role: data.role ?? null,
    subscriptionPlan: data.subscriptionPlan ?? "free",
    scansUsed: data.scansUsed ?? 0,
    lastScanReset: data.lastScanReset ?? new Date().toISOString(),
    subscriptionId: data.subscriptionId ?? null,
    customerId: data.customerId ?? null,
    paddleStatus: data.paddleStatus ?? null,
    teamId: data.teamId ?? null,
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

function docToBillingEvent(id: string, data: FirebaseFirestore.DocumentData): BillingEvent {
  return {
    id,
    userId: data.userId,
    eventType: data.eventType,
    fromPlan: data.fromPlan ?? null,
    toPlan: data.toPlan ?? null,
    subscriptionId: data.subscriptionId ?? null,
    customerId: data.customerId ?? null,
    metadata: data.metadata ?? null,
    createdAt: data.createdAt ?? new Date().toISOString(),
  };
}

function docToTeam(id: string, data: FirebaseFirestore.DocumentData): Team {
  return {
    id,
    name: data.name ?? "",
    ownerId: data.ownerId ?? "",
    seatsLimit: data.seatsLimit ?? 5,
    createdAt: data.createdAt ?? new Date().toISOString(),
  };
}

function docToTeamMember(id: string, data: FirebaseFirestore.DocumentData): TeamMember {
  return {
    id,
    teamId: data.teamId ?? "",
    userId: data.userId ?? null,
    email: data.email ?? "",
    role: data.role ?? "member",
    status: data.status ?? "invited",
    joinedAt: data.joinedAt ?? null,
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
      .get();
    const docs = snap.docs.map((d) => docToScan(d.id, d.data()));
    return docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

  async createUserMetadata(user: { userId: string; email: string; name?: string }): Promise<UserMetadata> {
    const now = new Date().toISOString();
    const existing = await this.getUserMetadata(user.userId);
    const data: Record<string, any> = {
      userId: user.userId,
      email: user.email,
      subscriptionPlan: "free",
      scansUsed: 0,
      lastScanReset: now,
      subscriptionId: null,
      customerId: null,
      paddleStatus: null,
      teamId: null,
      createdAt: now,
    };
    if (user.name) data.name = user.name;
    await this.db.collection("users").doc(user.userId).set(data, { merge: true });

    if (!existing) {
      try {
        await this.logBillingEvent({
          userId: user.userId,
          eventType: "account_created",
          fromPlan: null,
          toPlan: "free",
        });
      } catch {
        // non-critical
      }
    }

    return docToUserMetadata(user.userId, data);
  }

  async updateUserProfile(userId: string, profile: UpdateUserProfile): Promise<UserMetadata> {
    const fields: Record<string, any> = { updatedAt: new Date().toISOString() };
    if (profile.name !== undefined) fields.name = profile.name;
    if (profile.company !== undefined) fields.company = profile.company;
    if (profile.role !== undefined) fields.role = profile.role;
    await this.db.collection("users").doc(userId).set(fields, { merge: true });
    const doc = await this.db.collection("users").doc(userId).get();
    return docToUserMetadata(doc.id, doc.data()!);
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

  async logBillingEvent(event: InsertBillingEvent): Promise<BillingEvent> {
    const now = new Date().toISOString();
    const data = {
      userId: event.userId,
      eventType: event.eventType,
      fromPlan: event.fromPlan ?? null,
      toPlan: event.toPlan ?? null,
      subscriptionId: event.subscriptionId ?? null,
      customerId: event.customerId ?? null,
      metadata: event.metadata ?? null,
      createdAt: now,
    };
    const ref = await this.db.collection("billing_events").add(data);
    return docToBillingEvent(ref.id, data);
  }

  async getUserBillingEvents(userId: string): Promise<BillingEvent[]> {
    const snap = await this.db
      .collection("billing_events")
      .where("userId", "==", userId)
      .get();
    const docs = snap.docs.map((d) => docToBillingEvent(d.id, d.data()));
    return docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const now = new Date().toISOString();
    const data = {
      name: team.name,
      ownerId: team.ownerId,
      seatsLimit: team.seatsLimit ?? 5,
      createdAt: now,
    };
    const ref = await this.db.collection("teams").add(data);
    await this.db.collection("users").doc(team.ownerId).update({ teamId: ref.id });
    const ownerMemberData = {
      teamId: ref.id,
      userId: team.ownerId,
      email: "",
      role: "owner",
      status: "active",
      joinedAt: now,
      createdAt: now,
    };
    await this.db.collection("team_members").add(ownerMemberData);
    return docToTeam(ref.id, data);
  }

  async getTeamByOwner(ownerId: string): Promise<Team | undefined> {
    const snap = await this.db
      .collection("teams")
      .where("ownerId", "==", ownerId)
      .limit(1)
      .get();
    if (snap.empty) return undefined;
    return docToTeam(snap.docs[0].id, snap.docs[0].data());
  }

  async getTeam(teamId: string): Promise<Team | undefined> {
    const doc = await this.db.collection("teams").doc(teamId).get();
    if (!doc.exists) return undefined;
    return docToTeam(doc.id, doc.data()!);
  }

  async addTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const now = new Date().toISOString();
    const data = {
      teamId: member.teamId,
      userId: member.userId ?? null,
      email: member.email,
      role: member.role ?? "member",
      status: member.status ?? "invited",
      joinedAt: member.status === "active" ? now : null,
      createdAt: now,
    };
    const ref = await this.db.collection("team_members").add(data);
    return docToTeamMember(ref.id, data);
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const snap = await this.db
      .collection("team_members")
      .where("teamId", "==", teamId)
      .get();
    return snap.docs.map((d) => docToTeamMember(d.id, d.data()));
  }

  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    const snap = await this.db
      .collection("team_members")
      .where("teamId", "==", teamId)
      .where("userId", "==", userId)
      .limit(1)
      .get();
    if (!snap.empty) {
      await snap.docs[0].ref.update({ status: "removed" });
    }
  }

  async getUserResumes(userId: string) { return this.getUserScans(userId); }
  async getResume(id: string) { return this.getScan(id); }
  async createResume(resume: InsertScan) { return this.createScan(resume); }
  async updateResumeAnalysis(id: string, score: number, riskLevel: string, analysis: any, cleanText?: string, sections?: any) {
    return this.updateScanAnalysis(id, score, riskLevel, analysis, cleanText, sections);
  }
}

export const storage = new FirestoreStorage();
