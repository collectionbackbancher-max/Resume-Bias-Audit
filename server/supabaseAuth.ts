import { createClient } from "@supabase/supabase-js";
import type { RequestHandler } from "express";
import { authStorage } from "./replit_integrations/auth/storage";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export interface SupabaseUser {
  id: string;
  email: string;
  name?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: SupabaseUser;
    }
  }
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.slice(7);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const u = data.user;
  const email = u.email || "";
  const name = (u.user_metadata?.full_name || u.user_metadata?.name || email.split("@")[0]) as string;

  // Ensure local user record exists; use resolved DB id for all operations
  let resolvedId = u.id;
  try {
    const dbUser = await authStorage.upsertUser({
      id: u.id,
      email,
      firstName: u.user_metadata?.full_name?.split(" ")[0] || name,
      lastName: u.user_metadata?.full_name?.split(" ").slice(1).join(" ") || undefined,
      profileImageUrl: u.user_metadata?.avatar_url || undefined,
    });
    resolvedId = dbUser.id;
  } catch (err) {
    console.warn("[supabaseAuth] upsert user failed:", err);
  }

  req.user = { id: resolvedId, email, name };

  next();
};
