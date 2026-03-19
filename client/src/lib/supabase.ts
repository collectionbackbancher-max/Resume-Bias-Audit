import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "https://ajlyemjgrwooisevyxse.supabase.co";
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqbHllbWpncndvb2lzZXZ5eHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NzQxNzMsImV4cCI6MjA4OTQ1MDE3M30.80Aw1xntcURyKMRjdVD1O3au1hyVEQlqcmHc9oHfH1U";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
