import { useState } from "react";
import { Link, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setLocation("/");
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 overflow-hidden relative">
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl mix-blend-multiply filter" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl mix-blend-multiply filter" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-2xl group">
            <div className="bg-cyan-500/20 p-2.5 rounded-xl border border-cyan-500/30 group-hover:border-cyan-500/50 transition-colors">
              <ShieldCheck className="h-6 w-6 text-cyan-400" />
            </div>
            <span className="text-white">BiasAuditor<span className="text-cyan-400">.ai</span></span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="shadow-lg border-cyan-500/20 bg-gradient-to-br from-slate-900/50 to-black backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-display text-white">Welcome back</CardTitle>
              <CardDescription className="text-gray-400">Sign in to your BiasAuditor account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm" data-testid="status-login-error">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    data-testid="input-email"
                    className="bg-black/50 border-cyan-500/20 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    data-testid="input-password"
                    className="bg-black/50 border-cyan-500/20 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                  />
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-lg shadow-lg shadow-cyan-500/30 transition-all"
                    data-testid="button-login"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Signing in…
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </motion.div>
              </form>

              <div className="mt-4 text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <Link href="/signup" className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors" data-testid="link-signup">
                  Sign up free
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
