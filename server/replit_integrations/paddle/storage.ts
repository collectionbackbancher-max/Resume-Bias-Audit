import { getFirestore } from "../../firebaseAdmin";

export interface IPaddleStorage {
  updateUserPlan(
    userId: string,
    plan: "free" | "starter" | "team",
    subscriptionId: string,
    customerId: string
  ): Promise<void>;
  updateSubscriptionStatus(
    subscriptionId: string,
    status: "active" | "canceled" | "paused"
  ): Promise<void>;
  getUserBySubscriptionId(subscriptionId: string): Promise<any>;
}

class PaddleStorage implements IPaddleStorage {
  private get db() {
    return getFirestore();
  }

  async updateUserPlan(
    userId: string,
    plan: "free" | "starter" | "team",
    subscriptionId: string,
    customerId: string
  ): Promise<void> {
    await this.db.collection("users").doc(userId).set(
      {
        subscriptionPlan: plan,
        subscriptionId,
        customerId,
        paddleStatus: "active",
        scansUsed: 0,
        lastScanReset: new Date().toISOString(),
      },
      { merge: true }
    );
  }

  async updateSubscriptionStatus(
    subscriptionId: string,
    status: "active" | "canceled" | "paused"
  ): Promise<void> {
    const snap = await this.db
      .collection("users")
      .where("subscriptionId", "==", subscriptionId)
      .limit(1)
      .get();

    if (snap.empty) return;

    const update: Record<string, any> = { paddleStatus: status };
    if (status === "canceled") update.subscriptionPlan = "free";

    await snap.docs[0].ref.update(update);
  }

  async getUserBySubscriptionId(subscriptionId: string): Promise<any> {
    const snap = await this.db
      .collection("users")
      .where("subscriptionId", "==", subscriptionId)
      .limit(1)
      .get();

    if (snap.empty) return undefined;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  }
}

export const paddleStorage = new PaddleStorage();
