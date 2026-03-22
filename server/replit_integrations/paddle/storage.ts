import { usersMetadata } from "@shared/schema";
import { db } from "../../db";
import { eq } from "drizzle-orm";

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
  async updateUserPlan(
    userId: string,
    plan: "free" | "starter" | "team",
    subscriptionId: string,
    customerId: string
  ): Promise<void> {
    await db
      .update(usersMetadata)
      .set({
        subscriptionPlan: plan,
        subscriptionId,
        customerId,
        paddleStatus: "active",
        scansUsed: 0, // Reset scan count on new subscription
        lastScanReset: new Date(),
      })
      .where(eq(usersMetadata.userId, userId));
  }

  async updateSubscriptionStatus(
    subscriptionId: string,
    status: "active" | "canceled" | "paused"
  ): Promise<void> {
    await db
      .update(usersMetadata)
      .set({
        paddleStatus: status,
        subscriptionPlan: status === "canceled" ? "free" : undefined,
      })
      .where(eq(usersMetadata.subscriptionId, subscriptionId));
  }

  async getUserBySubscriptionId(subscriptionId: string): Promise<any> {
    const [user] = await db
      .select()
      .from(usersMetadata)
      .where(eq(usersMetadata.subscriptionId, subscriptionId));
    return user;
  }
}

export const paddleStorage = new PaddleStorage();
