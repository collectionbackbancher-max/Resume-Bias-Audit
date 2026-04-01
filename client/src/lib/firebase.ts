import { initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

let auth: Auth;

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;

if (!apiKey) {
  console.warn(
    "[Firebase] VITE_FIREBASE_API_KEY is not set. " +
    "Authentication will not work until Firebase environment variables are configured."
  );
}

try {
  const app = initializeApp({
    apiKey: apiKey ?? "placeholder-configure-vite-firebase-api-key",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
    appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  });
  auth = getAuth(app);
} catch (err) {
  console.error("[Firebase] Initialization failed:", err);
  auth = null as unknown as Auth;
}

export { auth };
