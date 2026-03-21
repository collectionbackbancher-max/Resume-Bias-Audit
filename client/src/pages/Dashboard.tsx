import { useResumes } from "@/hooks/use-resumes";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import {
  FileText,
  Plus,
  ArrowRight,
  Loader2,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  BarChart3,
  Target,
  Plug,
  ChevronRight,
  Activity,
  Upload,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

function RiskPill({ risk }: { risk: string | null }) {
  if (!risk) return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-gray-500/20 text-gray-400 border-gray-500/30">
      Pending
    </span>
  );
  const s: Record<string, string> = {
    Low: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    Moderate: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    High: "bg-red-500/20 text-red-300 border-red-500/30",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${s[risk] || s.Moderate}`}>
      {risk} Risk
    </span>
  );
}

function ScoreRing({ score }: { score: number | null }) {
  if (score === null) return (
    <div className="w-11 h-11 rounded-full border-2 border-white/10 flex items-center justify-center shrink-0">
      <span className="text-[10px] text-gray-500">—</span>
    </div>
  );
  const color = score >= 80 ? "#34d399" : score >= 60 ? "#facc15" : "#f87171";
  const r = 17;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative w-11 h-11 shrink-0">
      <svg width="44" height="44" className="-rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
        <circle
          cx="22" cy="22" r={r} fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - score / 100)}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  icon: React.ElementType;
  textColor: string;
  borderColor: string;
  bgColor: string;
  iconBg: string;
  delay: number;
}

function StatCard({ label, value, suffix, icon: Icon, textColor, borderColor, bgColor, iconBg, delay }: StatCardProps) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" custom={delay}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className={`relative rounded-2xl border ${borderColor} bg-gradient-to-br ${bgColor} p-5 overflow-hidden`}
        data-testid={`stat-card-${label.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <div className={`absolute top-0 right-0 w-20 h-20 ${iconBg} rounded-full -translate-y-8 translate-x-8 blur-2xl opacity-60`} />
        <div className={`inline-flex p-2.5 rounded-xl ${iconBg} mb-3 border ${borderColor}`}>
          <Icon className={`h-4 w-4 ${textColor}`} />
        </div>
        <div className={`text-3xl font-display font-bold ${textColor} leading-none`}>
          {value}
          {suffix && <span className="text-base text-gray-500 font-normal ml-1">{suffix}</span>}
        </div>
        <p className="text-xs text-gray-400 mt-1.5 font-medium">{label}</p>
      </motion.div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { data: resumes, isLoading, error } = useResumes();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: planData } = useQuery({
    queryKey: ["/api/user/plan"],
    queryFn: () => apiRequest("GET", "/api/user/plan").then((res: any) => res.data ?? res),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-cyan-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-4">
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>
        <div>
          <h2 className="font-bold text-white mb-1">Failed to load dashboard</h2>
          <p className="text-sm text-gray-400">Could not fetch your analysis history.</p>
        </div>
        <Button onClick={() => window.location.reload()} size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold">
          Try Again
        </Button>
      </div>
    );
  }

  const sorted = [...(resumes || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const total = sorted.length;
  const avgScore = total
    ? Math.round(sorted.reduce((acc, r) => acc + (r.score ?? 0), 0) / total)
    : null;
  const riskCounts = {
    Low: sorted.filter((r) => r.riskLevel === "Low").length,
    Moderate: sorted.filter((r) => r.riskLevel === "Moderate").length,
    High: sorted.filter((r) => r.riskLevel === "High").length,
  };

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const planPct = planData ? Math.min((planData.scans_used / planData.scans_limit) * 100, 100) : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* ── Hero Header ── */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}
        className="relative rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-black p-7 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full translate-x-24 -translate-y-24 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-blue-500/10 rounded-full translate-y-12 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
          <div>
            <p className="text-sm text-gray-400 mb-1 font-medium">{greeting} 👋</p>
            <h1 className="text-3xl font-display font-bold text-white">
              Welcome back,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                {firstName}
              </span>
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              {total === 0
                ? "Start your first bias audit to get insights."
                : `You've audited ${total} resume${total === 1 ? "" : "s"}${avgScore !== null ? ` · avg. fairness score ${avgScore}/100` : ""}.`}
            </p>
          </div>

          <div className="flex gap-2.5 shrink-0">
            <Link href="/integrations">
              <Button variant="outline" size="sm"
                className="gap-2 rounded-xl border-cyan-500/30 text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/50 bg-transparent"
                data-testid="button-go-integrations"
              >
                <Plug className="h-3.5 w-3.5" /> Integrations
              </Button>
            </Link>
            <Link href="/upload">
              <Button size="sm"
                className="gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-black font-semibold shadow-lg shadow-cyan-500/30"
                data-testid="button-new-audit"
              >
                <Plus className="h-4 w-4" /> New Audit
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Audits" value={total} icon={FileText} delay={1}
          textColor="text-blue-400" borderColor="border-blue-500/20"
          bgColor="from-blue-500/10 to-blue-600/5" iconBg="bg-blue-500/15"
        />
        <StatCard
          label="Avg. Fairness" value={avgScore ?? "—"} suffix={avgScore !== null ? "/100" : ""} icon={TrendingUp} delay={2}
          textColor="text-cyan-400" borderColor="border-cyan-500/20"
          bgColor="from-cyan-500/10 to-cyan-600/5" iconBg="bg-cyan-500/15"
        />
        <StatCard
          label="Low Risk" value={riskCounts.Low} icon={CheckCircle2} delay={3}
          textColor="text-emerald-400" borderColor="border-emerald-500/20"
          bgColor="from-emerald-500/10 to-emerald-600/5" iconBg="bg-emerald-500/15"
        />
        <StatCard
          label="High Risk" value={riskCounts.High} icon={AlertTriangle} delay={4}
          textColor="text-red-400" borderColor="border-red-500/20"
          bgColor="from-red-500/10 to-red-600/5" iconBg="bg-red-500/15"
        />
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Recent Audits ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5} className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-gray-500" />
              <h2 className="font-display font-semibold text-sm text-gray-300">Recent Audits</h2>
            </div>
            {sorted.length > 6 && (
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 h-7 px-2">
                View all <ChevronRight className="h-3 w-3" />
              </Button>
            )}
          </div>

          {sorted.length === 0 ? (
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={6}>
              <div className="rounded-2xl border-2 border-dashed border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 py-16 flex flex-col items-center text-center gap-5">
                <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                  <Upload className="h-10 w-10 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white mb-1">No audits yet</h3>
                  <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                    Upload a resume to detect unconscious bias markers and get AI-powered rewrite suggestions.
                  </p>
                </div>
                <Link href="/upload">
                  <Button
                    className="gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-black font-semibold shadow-lg shadow-cyan-500/30"
                    data-testid="button-first-audit"
                  >
                    <Plus className="h-4 w-4" /> Start Your First Audit
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {sorted.slice(0, 8).map((resume, i) => (
                <motion.div key={resume.id} variants={fadeUp} initial="hidden" animate="show" custom={i + 5}>
                  <motion.div
                    onClick={() => setLocation(`/report/${resume.id}`)}
                    whileHover={{ x: 6 }}
                    transition={{ duration: 0.15 }}
                    className="group flex items-center gap-4 p-4 rounded-xl border border-cyan-500/10 bg-gradient-to-br from-slate-900/60 to-black hover:border-cyan-500/40 hover:from-slate-900/80 hover:to-black hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer transition-all duration-200"
                    data-testid={`card-resume-${resume.id}`}
                  >
                    <ScoreRing score={resume.score ?? null} />

                    <div className="flex-1 min-w-0">
                      <p
                        className="font-medium text-sm text-white truncate group-hover:text-cyan-300 transition-colors"
                        data-testid={`text-filename-${resume.id}`}
                      >
                        {resume.filename}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock className="h-3 w-3 text-gray-600" />
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(resume.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    <div className="hidden sm:block shrink-0">
                      <RiskPill risk={resume.riskLevel ?? null} />
                    </div>

                    <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">

          {/* Plan card */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5}>
            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-black p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/20">
                    <Zap className="h-3.5 w-3.5 text-cyan-400" />
                  </div>
                  <span className="text-sm font-semibold text-white capitalize">
                    {planData?.plan ?? "Free"} Plan
                  </span>
                </div>
                {planData?.plan !== "team" && (
                  <Link href="/pricing">
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-cyan-400 hover:bg-cyan-500/10 gap-1">
                      Upgrade <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Scans used</span>
                  <span className="font-medium text-white">
                    {planData?.scans_used ?? 0} / {planData?.scans_limit ?? 5}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
                  <motion.div
                    className={`h-full rounded-full ${planPct >= 90 ? "bg-red-400" : planPct >= 70 ? "bg-yellow-400" : "bg-gradient-to-r from-cyan-400 to-blue-400"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${planPct}%` }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  <span className="font-medium text-gray-300">
                    {planData?.scans_remaining ?? (5 - (planData?.scans_used ?? 0))}
                  </span>{" "}scans remaining this month
                </p>
              </div>

              <Link href="/upload">
                <Button
                  className="w-full gap-2 rounded-xl text-sm bg-cyan-500 hover:bg-cyan-600 text-black font-semibold shadow-md shadow-cyan-500/20"
                  size="sm"
                  data-testid="button-sidebar-audit"
                >
                  <Plus className="h-3.5 w-3.5" /> New Audit
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Risk breakdown */}
          {total > 0 && (
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={6}>
              <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-black p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-sm font-semibold text-white">Risk Distribution</span>
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Low", count: riskCounts.Low, bar: "bg-emerald-400", text: "text-emerald-400" },
                    { label: "Moderate", count: riskCounts.Moderate, bar: "bg-yellow-400", text: "text-yellow-400" },
                    { label: "High", count: riskCounts.High, bar: "bg-red-400", text: "text-red-400" },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{item.label} Risk</span>
                        <span className={`font-semibold ${item.text}`}>{item.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${item.bar}`}
                          initial={{ width: 0 }}
                          animate={{ width: total > 0 ? `${(item.count / total) * 100}%` : "0%" }}
                          transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {avgScore !== null && (
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Avg. Fairness Score</span>
                    <div className="flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-cyan-400" />
                      <span className={`text-sm font-bold ${avgScore >= 80 ? "text-emerald-400" : avgScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                        {avgScore}/100
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Quick actions */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={7}>
            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-black p-5 space-y-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</p>
              {[
                { label: "Upload Resume", icon: Upload, href: "/upload", desc: "Single or bulk scan" },
                { label: "ATS Integrations", icon: Plug, href: "/integrations", desc: "Connect Greenhouse" },
                { label: "View Pricing", icon: ShieldCheck, href: "/pricing", desc: "Upgrade your plan" },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <motion.div
                    whileHover={{ x: 3 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-cyan-500/10 transition-colors cursor-pointer group"
                    data-testid={`quick-action-${action.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="p-1.5 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 border border-cyan-500/20 transition-colors">
                      <action.icon className="h-3.5 w-3.5 text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white leading-none mb-0.5">{action.label}</p>
                      <p className="text-xs text-gray-500">{action.desc}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-600 group-hover:text-cyan-400 transition-colors shrink-0" />
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Pro tip */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={8}>
            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-xs font-semibold text-cyan-400">Pro Tip</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Resumes scoring <span className="text-white font-medium">85+</span> show minimal bias. Use AI suggestions in each report to improve language neutrality.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
