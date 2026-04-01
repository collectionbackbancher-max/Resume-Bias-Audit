import type { RequestHandler } from "express";
import { getAuth, getFirestore } from "./firebaseAdmin";

export interface FirebaseUser {
  id: string;
  email: string;
  name?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: FirebaseUser;
    }
  }
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = await getAuth().verifyIdToken(token);

    const uid = decoded.uid;
    const email = decoded.email || "";
    const name =
      (decoded.name as string | undefined) ||
      decoded.display_name ||
      email.split("@")[0];

    // Ensure the user document exists in Firestore with all required fields
    try {
      const db = getFirestore();
      const userRef = db.collection("users").doc(uid);
      const snap = await userRef.get();
      const now = new Date().toISOString();
      if (!snap.exists) {
        await userRef.set({
          userId: uid,
          email,
          name,
          subscriptionPlan: "free",
          scansUsed: 0,
          lastScanReset: now,
          subscriptionId: null,
          customerId: null,
          createdAt: now,
          updatedAt: now,
        });
      } else {
        await userRef.set({ email, name, updatedAt: now }, { merge: true });
      }
    } catch (err) {
      console.warn("[firebaseAuth] upsert user failed:", err);
    }

    req.user = { id: uid, email, name };
    next();
  } catch (err) {
    console.warn("[firebaseAuth] token verification failed:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
