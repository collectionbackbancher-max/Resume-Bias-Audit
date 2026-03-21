import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
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
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07 } }),
};

function riskColor(level: string) {
  if (!level) return "text-muted-foreground";
  const l = level.toLowerCase();
  if (l === "low") return "text-emerald-400";
  if (l === "moderate") return "text-yellow-400";
  if (l === "high") return "text-red-400";
  return "text-muted-foreground";
}

function riskBadge(level: string) {
  const l = (level || "").toLowerCase();
  if (l === "low") return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">Low Risk</Badge>;
  if (l === "moderate") return <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20">Moderate Risk</Badge>;
  if (l === "high") return <Badge className="bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/20">High Risk</Badge>;
  return <Badge variant="outline">{level}</Badge>;
}

function RiskIcon({ level }: { level: string }) {
  const l = (level || "").toLowerCase();
  if (l === "low") return <ShieldCheck className="h-4 w-4 text-emerald-400" />;
  if (l === "moderate") return <ShieldAlert className="h-4 w-4 text-yellow-400" />;
  return <ShieldX className="h-4 w-4 text-red-400" />;
}

export default function Integrations() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [apiKey, setApiKey] = useState("");
  const [scanResults, setScanResults] = useState<any[]>([]);

  const { data: status, isLoading: statusLoading } = useQuery<{ connected: boolean; provider?: string; connectedAt?: string }>({
    queryKey: ["/api/ats/status"],
  });

  const { data: candidates, isLoading: candidatesLoading, refetch: refetchCandidates } = useQuery<any[]>({
    queryKey: ["/api/ats/candidates"],
    enabled: status?.connected === true,
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
    mutationFn: async () => {
      const data = await apiRequest("POST", "/api/ats/scan");
      return data;
    },
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
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Plug className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">ATS Integrations</h1>
            <p className="text-sm text-muted-foreground">Connect your hiring tools to audit candidates at scale</p>
          </div>
        </div>
      </motion.div>

      {/* Greenhouse Connect Card */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <span className="text-green-400 font-bold text-sm">GH</span>
                </div>
                <div>
                  <CardTitle className="text-base">Greenhouse</CardTitle>
                  <CardDescription className="text-xs">Applicant Tracking System</CardDescription>
                </div>
              </div>
              {statusLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : isConnected ? (
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1.5">
                  <CheckCircle2 className="h-3 w-3" /> Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground gap-1.5">
                  <Unplug className="h-3 w-3" /> Not Connected
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {!isConnected ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Enter your Greenhouse Harvest API key to import candidates and run bias analysis on their resumes.{" "}
                  <a
                    href="https://developers.greenhouse.io/harvest.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
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
                    className="bg-background/50"
                    data-testid="input-api-key"
                  />
                  <Button
                    onClick={() => connectMutation.mutate()}
                    disabled={!apiKey.trim() || connectMutation.isPending}
                    className="shrink-0 gap-2"
                    data-testid="button-connect-greenhouse"
                  >
                    {connectMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plug className="h-4 w-4" />
                    )}
                    Connect Greenhouse
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Greenhouse is connected
                  {status?.connectedAt && (
                    <span className="text-xs">· since {new Date(status.connectedAt).toLocaleDateString()}</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => disconnectMutation.mutate()}
                  disabled={disconnectMutation.isPending}
                  className="text-muted-foreground hover:text-destructive gap-1.5 text-xs"
                  data-testid="button-disconnect"
                >
                  {disconnectMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Unplug className="h-3 w-3" />}
                  Disconnect
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Coming Soon Integrations */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">More providers coming soon</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {["Lever", "Workday", "BambooHR", "iCIMS", "SmartRecruiters", "Taleo"].map((name) => (
            <div
              key={name}
              className="flex items-center gap-2.5 p-3 rounded-xl border border-dashed border-border/50 text-muted-foreground/50"
            >
              <div className="w-7 h-7 rounded-lg bg-muted/30 flex items-center justify-center text-[10px] font-bold">
                {name.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-sm">{name}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Candidates Section — only show when connected */}
      {isConnected && (
        <>
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Candidates
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Fetched from your Greenhouse account
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchCandidates()}
                      disabled={candidatesLoading}
                      className="gap-2 rounded-xl text-xs"
                      data-testid="button-fetch-candidates"
                    >
                      {candidatesLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                      Refresh
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => scanMutation.mutate()}
                      disabled={scanMutation.isPending || !candidates?.length}
                      className="gap-2 rounded-xl text-xs"
                      data-testid="button-scan-candidates"
                    >
                      {scanMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ScanLine className="h-3.5 w-3.5" />
                      )}
                      Scan All Candidates
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {candidatesLoading ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Fetching candidates from Greenhouse...</span>
                  </div>
                ) : candidates && candidates.length > 0 ? (
                  <div className="space-y-2">
                    {candidates.map((c, i) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-background/30 border border-border/30 hover:border-border/60 transition-colors"
                        data-testid={`row-candidate-${c.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium" data-testid={`text-candidate-name-${c.id}`}>{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.job_title} · Applied {c.applied_at}</p>
                          </div>
                        </div>
                        <a
                          href={c.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                          data-testid={`link-resume-${c.id}`}
                        >
                          <FileText className="h-3 w-3" />
                          Resume
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12 text-muted-foreground gap-3">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="text-sm">No candidates found. Click Refresh to fetch.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Scan Results */}
          {scanResults.length > 0 && (
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ScanLine className="h-4 w-4 text-primary" />
                    Bias Analysis Results
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Resume bias scores for all candidates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scanResults.map((result, i) => (
                      <motion.div
                        key={result.candidate_id}
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        custom={i * 0.5}
                        className="p-4 rounded-xl border border-border/40 bg-background/30 space-y-3"
                        data-testid={`scan-result-${result.candidate_id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <RiskIcon level={result.risk_level} />
                            <div>
                              <p className="text-sm font-medium" data-testid={`text-result-name-${result.candidate_id}`}>{result.name}</p>
                              <p className="text-xs text-muted-foreground">{result.job_title}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Fairness Score</p>
                              <p className={`text-lg font-bold ${riskColor(result.risk_level)}`} data-testid={`text-bias-score-${result.candidate_id}`}>
                                {result.bias_score ?? "—"}
                              </p>
                            </div>
                            {riskBadge(result.risk_level)}
                          </div>
                        </div>

                        {result.flags && result.flags.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-xs text-muted-foreground font-medium">Flagged phrases</p>
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
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
