"use client";

import { useEffect, useState } from "react";
import { createClient, type Session } from "@supabase/supabase-js";

type Scan = {
  id: string;
  user_id: string;
  created_at?: string;
  [key: string]: unknown;
};

type UserData = {
  id: string;
  subscription_plan?: string | null;
  scans_used?: number | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export default function DashboardPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [scans, setScans] = useState<Scan[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setError(
        "Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Netlify.",
      );
      setLoading(false);
      return;
    }

    const getSession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        setError(sessionError.message);
      }
      setSession(data.session);
      setLoading(false);
    };

    getSession();
  }, []);

  useEffect(() => {
    if (!loading && !session && !error) {
      window.location.href = "/login";
    }
  }, [session, loading, error]);

  useEffect(() => {
    if (!session) return;
    if (!supabase) return;

    const fetchData = async () => {
      setError(null);
      const userId = session.user.id;

      const { data: scansData, error: scansError } = await supabase
        .from("scans")
        .select("*")
        .eq("user_id", userId);

      const { data: userInfo, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (scansError) {
        setError(scansError.message);
      } else {
        setScans(scansData ?? []);
      }

      if (userError) {
        setError((prev) => prev ?? userError.message);
      } else {
        setUserData(userInfo as UserData);
      }
    };

    fetchData();
  }, [session]);

  useEffect(() => {
    console.log("Session:", session);
    console.log("User ID:", session?.user?.id);
    console.log("Scans:", scans);
    console.log("User Data:", userData);
  }, [session, scans, userData]);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return <div>Error loading dashboard: {error}</div>;
  }

  if (!session) {
    return <div>Redirecting...</div>;
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <p>User email: {session.user.email}</p>
      <p>Plan: {userData?.subscription_plan ?? "N/A"}</p>
      <p>Scans used: {userData?.scans_used ?? 0}</p>

      <h2>Scans</h2>
      {scans.length === 0 ? (
        <p>No scans found.</p>
      ) : (
        <ul>
          {scans.map((scan) => (
            <li key={scan.id}>
              Scan ID: {scan.id}
              {scan.created_at ? ` | Created: ${scan.created_at}` : ""}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
