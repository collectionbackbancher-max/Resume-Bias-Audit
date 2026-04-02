import type { RequestHandler } from "express";
import { getAuth } from "./firebaseAdmin";
import { storage } from "./storage";

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

    // Ensure the user document exists in Firestore (logs account_created on first creation)
    try {
      await storage.createUserMetadata({ userId: uid, email, name });
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
