import admin from "firebase-admin";

let app: admin.app.App | undefined;

export function getFirebaseAdmin(): admin.app.App {
  if (app) return app;

  const projectId = (process.env.FIREBASE_PROJECT_ID ?? "").trim().replace(/^["']|["']$/g, "").trim();

  // Strip surrounding quotes and whitespace from client email
  const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL ?? "").trim().replace(/^["']|["']$/g, "").trim();

  // Normalize the private key: strip JSON punctuation, quotes, then convert escaped newlines
  let privateKey = process.env.FIREBASE_PRIVATE_KEY ?? "";
  privateKey = privateKey.trim();
  privateKey = privateKey.replace(/,\s*$/, "");            // strip trailing comma
  privateKey = privateKey.replace(/^["']|["']$/g, "");     // strip surrounding quotes
  privateKey = privateKey.trim();
  privateKey = privateKey.replace(/\\\\n/g, "\n");         // double-escaped \\n → newline
  privateKey = privateKey.replace(/\\n/g, "\n");           // single-escaped \n → newline

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin credentials not configured. " +
        "Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
    );
  }

  app = admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    projectId,
  });

  return app;
}

export function getFirestore(): admin.firestore.Firestore {
  return getFirebaseAdmin().firestore();
}

export function getAuth(): admin.auth.Auth {
  return getFirebaseAdmin().auth();
}
