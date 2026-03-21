import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Plug,
  Unplug,
  RefreshCw,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Loader2,
  Users,
  FileText,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Lock,
  Zap,
  ArrowRight,
  Star,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07 } }),
};

function riskColor(level: string) {
  const l = (level || "").toLowerCase();
  if (l === "low") return "text-emerald-400";
  if (l === "moderate") return "text-yellow-400";
  if (l === "high") return "text-red-400";
  return "text-gray-400";
}

function RiskBadge({ level }: { level: string }) {
  const l = (level || "").toLowerCase();
  if (l === "low") return <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Low Risk</span>;
  if (l === "moderate") return <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-yellow-500/15 text-yellow-400 border-yellow-500/30">Moderate Risk</span>;
  if (l === "high") return <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-red-500/15 text-red-400 border-red-500/30">High Risk</span>;
  return <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-white/10 text-gray-400">{level}</span>;
}

function RiskIcon({ level }: { level: string }) {
  const l = (level || "").toLowerCase();
  if (l === "low") return <ShieldCheck className="h-4 w-4 text-emerald-400" />;
  if (l === "moderate") return <ShieldAlert className="h-4 w-4 text-yellow-400" />;
  return <ShieldX className="h-4 w-4 text-red-400" />;
}

function UpgradeGate() {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
      <div className="relative rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-black overflow-hidden">
        {/* Blurred mock content beneath the gate */}
        <div className="blur-sm pointer-events-none select-none p-6 space-y-4 opacity-40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <span className="text-green-400 font-bold text-sm">GH</span>
            </div>
            <div>
              <div className="h-4 w-32 bg-white/10 rounded mb-1" />
              <div className="h-3 w-48 bg-white/10 rounded" />
            </div>
          </div>
          <div className="h-10 bg-white/5 rounded-xl border border-white/10" />
          <div className="h-10 w-40 bg-cyan-500/20 rounded-xl" />
        </div>

        {/* Upgrade overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-black/60 backdrop-blur-sm">
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-4">
            <Lock className="h-8 w-8 text-cyan-400" />
          </div>
          <h3 className="text-xl font-display font-bold text-white mb-2">ATS Integrations — Pro Feature</h3>
          <p className="text-sm text-gray-400 max-w-xs leading-relaxed mb-6">
            Connect Greenhouse and other ATS platforms to import candidates and run bias analysis at scale. Available on Starter and Team plans.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/pricing">
              <Button className="gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-black font-semibold shadow-lg shadow-cyan-500/30" data-testid="button-upgrade-for-ats">
                <Zap className="h-4 w-4" /> Upgrade to Starter
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="gap-2 rounded-xl border-white/10 text-gray-300 hover:text-white hover:bg-white/5 bg-transparent">
                View all plans <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Integrations() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState("");
  const [scanResults, setScanResults] = useState<any[]>([]);

  const { data: planData, isLoading: planLoading } = useQuery<any>({
    queryKey: ["/api/user/plan"],
    queryFn: () => apiRequest("GET", "/api/user/plan").then((r: any) => r.data ?? r),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const hasAts = planData?.features?.ats_integrations === true;

  const { data: status, isLoading: statusLoading } = useQuery<{ connected: boolean; provider?: string; connectedAt?: string }>({
    queryKey: ["/api/ats/status"],
    enabled: hasAts,
  });

  const { data: candidates, isLoading: candidatesLoading, refetch: refetchCandidates } = useQuery<any[]>({
    queryKey: ["/api/ats/candidates"],
    enabled: hasAts && status?.connected === true,
  });

  const connectMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/ats/connect", { apiKey, provider: "greenhouse" }),
    onSuccess: () => {
      toast({ title: "Greenhouse connected!", description: "Your ATS account is now linked." });
      setApiKey("");
      qc.invalidateQueries({ queryKey: ["/api/ats/status"] });
      qc.invalidateQueries({ queryKey: ["/api/ats/candidates"] });
    },
    onError: (err: any) => {
      toast({ title: "Connection failed", description: err.message, variant: "destructive" });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/ats/disconnect"),
    onSuccess: () => {
      toast({ title: "Disconnected", description: "ATS account removed." });
      setScanResults([]);
      qc.invalidateQueries({ queryKey: ["/api/ats/status"] });
      qc.invalidateQueries({ queryKey: ["/api/ats/candidates"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not disconnect.", variant: "destructive" });
    },
  });

  const scanMutation = useMutation({
    mutationFn: async () => apiRequest("POST", "/api/ats/scan"),
    onSuccess: (data: any) => {
      setScanResults(data);
      toast({ title: "Scan complete!", description: `Analyzed ${data.length} candidate resumes.` });
    },
    onError: () => {
      toast({ title: "Scan failed", description: "Could not complete bias analysis.", variant: "destructive" });
    },
  });

  const isConnected = status?.connected;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/20">
              <Plug className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-white">ATS Integrations</h1>
              <p className="text-sm text-gray-400">Connect your hiring tools to audit candidates at scale</p>
            </div>
          </div>

          {/* Plan badge */}
          {!planLoading && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              hasAts
                ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                : "bg-white/5 border-white/10 text-gray-500"
            }`}>
              {hasAts ? <Star className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              <span className="capitalize">{planData?.plan ?? "Free"} Plan</span>
              {!hasAts && <span className="text-gray-600">· Upgrade to unlock</span>}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Upgrade gate or Greenhouse card ── */}
      {planLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-7 w-7 text-cyan-400 animate-spin" />
        </div>
      ) : !hasAts ? (
        <UpgradeGate />
      ) : (
        <>
          {/* Greenhouse Connect Card */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-black p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <span className="text-green-400 font-bold text-sm">GH</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Greenhouse</p>
                    <p className="text-xs text-gray-400">Applicant Tracking System</p>
                  </div>
                </div>
                {statusLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                ) : isConnected ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                    <CheckCircle2 className="h-3 w-3" /> Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border border-white/10 text-gray-500">
                    <Unplug className="h-3 w-3" /> Not Connected
                  </span>
                )}
              </div>

              {!isConnected ? (
                <>
                  <p className="text-sm text-gray-400">
                    Enter your Greenhouse Harvest API key to import candidates and run bias analysis on their resumes.{" "}
                    <a
                      href="https://developers.greenhouse.io/harvest.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 hover:underline inline-flex items-center gap-1"
                      data-testid="link-greenhouse-docs"
                    >
                      View docs <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                  <div className="flex gap-3">
                    <Input
                      type="password"
                      placeholder="Enter your Greenhouse API key..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                      data-testid="input-api-key"
                    />
                    <Button
                      onClick={() => connectMutation.mutate()}
                      disabled={!apiKey.trim() || connectMutation.isPending}
                      className="shrink-0 gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-black font-semibold shadow-md shadow-cyan-500/20"
                      data-testid="button-connect-greenhouse"
                    >
                      {connectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plug className="h-4 w-4" />}
                      Connect
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Greenhouse is connected
                    {status?.connectedAt && (
                      <span className="text-xs text-gray-600">· since {new Date(status.connectedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => disconnectMutation.mutate()}
                    disabled={disconnectMutation.isPending}
                    className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 gap-1.5 text-xs rounded-lg"
                    data-testid="button-disconnect"
                  >
                    {disconnectMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Unplug className="h-3 w-3" />}
                    Disconnect
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Candidates Section */}
          {isConnected && (
            <>
              <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
                <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-black p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display font-semibold text-white flex items-center gap-2">
                        <Users className="h-4 w-4 text-cyan-400" /> Candidates
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">Fetched from your Greenhouse account</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetchCandidates()}
                        disabled={candidatesLoading}
                        className="gap-2 rounded-xl text-xs border-white/10 text-gray-300 hover:text-white hover:bg-white/5 bg-transparent"
                        data-testid="button-fetch-candidates"
                      >
                        {candidatesLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                        Refresh
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => scanMutation.mutate()}
                        disabled={scanMutation.isPending || !candidates?.length}
                        className="gap-2 rounded-xl text-xs bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
                        data-testid="button-scan-candidates"
                      >
                        {scanMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ScanLine className="h-3.5 w-3.5" />}
                        Scan All
                      </Button>
                    </div>
                  </div>

                  {candidatesLoading ? (
                    <div className="flex items-center justify-center py-10 text-gray-500 gap-3">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm">Fetching candidates...</span>
                    </div>
                  ) : candidates && candidates.length > 0 ? (
                    <div className="space-y-2">
                      {candidates.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-cyan-500/20 transition-colors"
                          data-testid={`row-candidate-${c.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-400">
                              {c.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white" data-testid={`text-candidate-name-${c.id}`}>{c.name}</p>
                              <p className="text-xs text-gray-500">{c.job_title} · Applied {c.applied_at}</p>
                            </div>
                          </div>
                          <a
                            href={c.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
                            data-testid={`link-resume-${c.id}`}
                          >
                            <FileText className="h-3 w-3" /> Resume
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-10 text-gray-500 gap-3">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="text-sm">No candidates found. Click Refresh to fetch.</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Scan Results */}
              {scanResults.length > 0 && (
                <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}>
                  <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-black p-6 space-y-5">
                    <div>
                      <h2 className="font-display font-semibold text-white flex items-center gap-2">
                        <ScanLine className="h-4 w-4 text-cyan-400" /> Bias Analysis Results
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">Resume fairness scores for all candidates</p>
                    </div>

                    <div className="space-y-3">
                      {scanResults.map((result, i) => (
                        <motion.div
                          key={result.candidate_id}
                          variants={fadeUp}
                          initial="hidden"
                          animate="show"
                          custom={i * 0.5}
                          className="p-4 rounded-xl border border-white/5 bg-white/[0.03] space-y-3"
                          data-testid={`scan-result-${result.candidate_id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <RiskIcon level={result.risk_level} />
                              <div>
                                <p className="text-sm font-medium text-white" data-testid={`text-result-name-${result.candidate_id}`}>{result.name}</p>
                                <p className="text-xs text-gray-500">{result.job_title}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Fairness Score</p>
                                <p className={`text-lg font-bold ${riskColor(result.risk_level)}`} data-testid={`text-bias-score-${result.candidate_id}`}>
                                  {result.bias_score ?? "—"}
                                </p>
                              </div>
                              <RiskBadge level={result.risk_level} />
                            </div>
                          </div>

                          {result.flags && result.flags.length > 0 && (
                            <div className="space-y-1.5">
                              <p className="text-xs text-gray-500 font-medium">Flagged phrases</p>
                              <div className="flex flex-wrap gap-2">
                                {result.flags.map((flag: any, fi: number) => (
                                  <span
                                    key={fi}
                                    className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                  >
                                    "{flag.phrase}" · {flag.category}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </>
      )}

      {/* ── Coming soon providers ── */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={hasAts ? 4 : 2}>
        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-3">More providers coming soon</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {["Lever", "Workday", "BambooHR", "iCIMS", "SmartRecruiters", "Taleo"].map((name) => (
            <div
              key={name}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-dashed border-white/5 text-gray-600"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold">
                {name.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-sm">{name}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
