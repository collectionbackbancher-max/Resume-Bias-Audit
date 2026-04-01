import admin from "firebase-admin";

let app: admin.app.App | undefined;

export function getFirebaseAdmin(): admin.app.App {
  if (app) return app;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Normalize the private key — handles literal \n sequences, double-escaped \\n,
  // surrounding quotes, and trailing JSON punctuation (e.g. value copied from JSON file)
  let privateKey = process.env.FIREBASE_PRIVATE_KEY ?? "";
  privateKey = privateKey.trim();                          // strip leading/trailing whitespace
  privateKey = privateKey.replace(/,?\s*$/, "");           // strip trailing comma or whitespace
  privateKey = privateKey.replace(/^["']|["']$/g, "");     // strip surrounding double/single quotes
  privateKey = privateKey.trim();                          // trim again after quote removal
  privateKey = privateKey.replace(/\\\\n/g, "\n");         // double-escaped: \\n → newline
  privateKey = privateKey.replace(/\\n/g, "\n");           // single-escaped: \n → newline

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
