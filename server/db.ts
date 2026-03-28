import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const dbUrl = process.env.SUPABASE_DATABASE_URL;

if (!dbUrl) {
  throw new Error(
    "SUPABASE_DATABASE_URL must be set. Please configure your Supabase database connection."
  );
}

export const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
export const db = drizzle(pool, { schema });
