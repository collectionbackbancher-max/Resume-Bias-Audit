import { getFirestore } from "../../firebaseAdmin";

export interface IChatStorage {
  getConversation(id: string): Promise<any | undefined>;
  getAllConversations(): Promise<any[]>;
  createConversation(title: string): Promise<any>;
  deleteConversation(id: string): Promise<void>;
  getMessagesByConversation(conversationId: string): Promise<any[]>;
  createMessage(conversationId: string, role: string, content: string): Promise<any>;
}

class FirestoreChatStorage implements IChatStorage {
  private get db() {
    return getFirestore();
  }

  async getAllConversations(): Promise<any[]> {
    const snap = await this.db.collection("conversations").orderBy("createdAt", "desc").get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async getConversation(id: string): Promise<any | undefined> {
    const doc = await this.db.collection("conversations").doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data() };
  }

  async createConversation(title: string): Promise<any> {
    const now = new Date().toISOString();
    const ref = await this.db.collection("conversations").add({ title, createdAt: now, updatedAt: now });
    return { id: ref.id, title, createdAt: now, updatedAt: now };
  }

  async deleteConversation(id: string): Promise<void> {
    const batch = this.db.batch();
    batch.delete(this.db.collection("conversations").doc(id));
    const msgs = await this.db.collection("messages").where("conversationId", "==", id).get();
    msgs.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  async getMessagesByConversation(conversationId: string): Promise<any[]> {
    const snap = await this.db
      .collection("messages")
      .where("conversationId", "==", conversationId)
      .orderBy("createdAt", "asc")
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async createMessage(conversationId: string, role: string, content: string): Promise<any> {
    const now = new Date().toISOString();
    const ref = await this.db.collection("messages").add({ conversationId, role, content, createdAt: now });
    await this.db.collection("conversations").doc(conversationId).set({ updatedAt: now }, { merge: true });
    return { id: ref.id, conversationId, role, content, createdAt: now };
  }
}

export const chatStorage: IChatStorage = new FirestoreChatStorage();
