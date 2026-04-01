import { getFirestore } from "../../firebaseAdmin";

export interface UpsertUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  private get db() {
    return getFirestore();
  }

  async getUser(id: string): Promise<User | undefined> {
    const doc = await this.db.collection("users").doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data() } as User;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const now = new Date().toISOString();
    const data: Record<string, any> = { updatedAt: now };
    if (userData.email) data.email = userData.email;
    if (userData.firstName) data.firstName = userData.firstName;
    if (userData.lastName) data.lastName = userData.lastName;
    if (userData.profileImageUrl) data.profileImageUrl = userData.profileImageUrl;

    const ref = this.db.collection("users").doc(userData.id);
    await ref.set({ createdAt: now, ...data }, { merge: true });
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() } as User;
  }
}

export const authStorage = new AuthStorage();
