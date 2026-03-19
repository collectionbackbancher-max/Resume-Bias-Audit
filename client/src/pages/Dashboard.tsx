import { useResumes } from "@/hooks/use-resumes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  BarChart3,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.08 } }),
};

function RiskBadge({ risk }: { risk: string | null }) {
  if (!risk) return <Badge variant="secondary" className="text-xs bg-gray-500/20 text-gray-300">Pending</Badge>;
  const styles: Record<string, string> = {
    Low: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    Moderate: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    High: "bg-red-500/20 text-red-300 border-red-500/30",
  };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-lg border ${styles[risk] || styles.Moderate}`}>
      {risk} Risk
    </span>
  );
}

function ScoreCircle({ score }: { score: number | null }) {
  if (score === null) return <span className="text-sm text-gray-400 italic">—</span>;
  const color = score >= 80 ? "text-emerald-400" : score >= 60 ? "text-yellow-400" : "text-red-400";
  return (
    <div className="text-right">
      <div className={`text-2xl font-display font-bold ${color}`}>{score}</div>
      <div className="text-xs text-gray-500">/ 100</div>
    </div>
  );
}

export default function Dashboard() {
  const { data: resumes, isLoading, error } = useResumes();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: planData } = useQuery({
    queryKey: ["/api/user/plan"],
    queryFn: () => apiRequest("GET", "/api/user/plan").then((res: any) => res.data),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
            <Loader2 className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
          </motion.div>
          <p className="text-gray-400">Loading your audits…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="bg-red-500/20 p-4 rounded-full mb-4 border border-red-500/30">
          <AlertCircle className="h-10 w-10 text-red-400" />
        </div>
        <h2 className="text-xl font-bold mb-2 text-white">Failed to load dashboard</h2>
        <p className="text-gray-400 mb-6">Could not fetch your analysis history.</p>
        <Button onClick={() => window.location.reload()} className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold">Try Again</Button>
      </div>
    );
  }

  const sortedResumes = [...(resumes || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const total = sortedResumes.length;
  const avgScore = total
    ? Math.round(sortedResumes.reduce((acc, r) => acc + (r.score || 0), 0) / total)
    : null;
  const riskCounts = {
    Low: sortedResumes.filter((r) => r.riskLevel === "Low").length,
    Moderate: sortedResumes.filter((r) => r.riskLevel === "Moderate").length,
    High: sortedResumes.filter((r) => r.riskLevel === "High").length,
  };

  const firstName = user?.firstName || user?.email?.split("@")[0] || "there";

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* ── Page header ── */}
      <motion.div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2" variants={fadeUp} initial="hidden" animate="show">
        <div>
          <h1 className="text-4xl font-display font-bold text-white">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{firstName}</span> 👋
          </h1>
          <p className="text-gray-400 mt-2">Here's an overview of your bias audit activity.</p>
        </div>
        <Link href="/upload">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              className="rounded-lg shadow-lg shadow-cyan-500/40 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold gap-2"
              data-testid="button-new-audit"
            >
              <Plus className="h-5 w-5" /> New Audit
            </Button>
          </motion.div>
        </Link>
      </motion.div>

      {/* ── Plan Card ── */}
      {planData && (
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show">
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                  <Zap className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white capitalize">{planData.plan} Plan</h3>
                  <p className="text-sm text-gray-400">
                    {planData.scans_used} / {planData.scans_limit} scans used this month
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyan-400">{planData.scans_remaining}</div>
                  <div className="text-xs text-gray-500">scans remaining</div>
                </div>
                {planData.plan !== "team" && (
                  <Link href="/pricing">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="sm" className="rounded-lg bg-cyan-500 hover:bg-cyan-600 text-black font-semibold gap-2">
                        <ArrowRight className="h-4 w-4" /> Upgrade
                      </Button>
                    </motion.div>
                  </Link>
                )}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4 h-2 bg-gray-700/30 rounded-full overflow-hidden border border-gray-600/30">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-400"
                initial={{ width: 0 }}
                animate={{ width: `${(planData.scans_used / planData.scans_limit) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Scans",
            value: total,
            icon: FileText,
            gradient: "from-blue-500/20 to-blue-600/10",
            borderColor: "border-blue-500/30",
            textColor: "text-blue-400",
            delay: 0,
          },
          {
            label: "Avg. Fairness Score",
            value: avgScore !== null ? `${avgScore}` : "—",
            suffix: avgScore !== null ? "/100" : "",
            icon: TrendingUp,
            gradient: "from-cyan-500/20 to-cyan-600/10",
            borderColor: "border-cyan-500/30",
            textColor: "text-cyan-400",
            delay: 1,
          },
          {
            label: "Low Risk",
            value: riskCounts.Low,
            icon: CheckCircle2,
            gradient: "from-emerald-500/20 to-emerald-600/10",
            borderColor: "border-emerald-500/30",
            textColor: "text-emerald-400",
            delay: 2,
          },
          {
            label: "High Risk",
            value: riskCounts.High,
            icon: AlertTriangle,
            gradient: "from-red-500/20 to-red-600/10",
            borderColor: "border-red-500/30",
            textColor: "text-red-400",
            delay: 3,
          },
        ].map((stat) => (
          <motion.div key={stat.label} custom={stat.delay} variants={fadeUp} initial="hidden" animate="show">
            <div className={`bg-gradient-to-br ${stat.gradient} backdrop-blur border ${stat.borderColor} rounded-2xl p-6 hover:shadow-lg hover:shadow-cyan-500/20 transition-all group`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-black/40 group-hover:bg-black/60 transition-colors`}>
                  <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
                </div>
              </div>
              <div className="space-y-1">
                <div className={`text-3xl font-display font-bold ${stat.textColor}`}>
                  {stat.value}
                  {stat.suffix && <span className="text-lg text-gray-500 ml-1">{stat.suffix}</span>}
                </div>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Risk breakdown bar ── */}
      {total > 0 && (
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show">
          <div className="bg-gradient-to-br from-slate-900/50 to-black border border-cyan-500/20 rounded-2xl p-6 hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-5 w-5 text-cyan-400" />
              <h3 className="text-lg font-display font-bold text-white">Risk Distribution</h3>
            </div>
            <div className="space-y-5">
              {[
                { label: "Low Risk", count: riskCounts.Low, color: "from-emerald-400 to-emerald-500", barColor: "bg-emerald-500" },
                { label: "Moderate Risk", count: riskCounts.Moderate, color: "from-yellow-400 to-yellow-500", barColor: "bg-yellow-500" },
                { label: "High Risk", count: riskCounts.High, color: "from-red-400 to-red-500", barColor: "bg-red-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <span className="text-sm text-gray-400 w-24 shrink-0">{item.label}</span>
                  <div className="flex-1 h-3 bg-gray-700/30 rounded-full overflow-hidden border border-gray-600/30">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: total > 0 ? `${(item.count / total) * 100}%` : "0%" }}
                      transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    />
                  </div>
                  <span className={`text-sm font-bold w-8 text-right text-gray-300`}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Recent Audits ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-display font-bold text-white">Recent Audits</h2>
          {sortedResumes.length > 5 && (
            <Button variant="ghost" size="sm" className="text-cyan-400 hover:bg-cyan-500/10 gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {sortedResumes.length === 0 ? (
          <div className="border-2 border-dashed border-cyan-500/20 rounded-2xl py-16 flex flex-col items-center text-center">
            <div className="bg-cyan-500/10 p-5 rounded-2xl mb-5 border border-cyan-500/20">
              <FileText className="h-12 w-12 text-cyan-400" />
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-2">No audits yet</h3>
            <p className="text-gray-400 mb-8 max-w-xs text-sm leading-relaxed">
              Upload your first resume to start detecting unconscious bias and get actionable AI suggestions.
            </p>
            <Link href="/upload">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="rounded-lg gap-2 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold" data-testid="button-first-audit">
                  <Plus className="h-5 w-5" /> Start Your First Audit
                </Button>
              </motion.div>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedResumes.map((resume, i) => (
              <motion.div key={resume.id} custom={i} variants={fadeUp} initial="hidden" animate="show">
                <div
                  onClick={() => setLocation(`/report/${resume.id}`)}
                  className="group bg-gradient-to-br from-slate-900/50 to-black hover:from-slate-900/70 hover:to-slate-950 border border-cyan-500/20 hover:border-cyan-500/50 rounded-2xl px-6 py-5 flex items-center justify-between cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/20"
                  data-testid={`card-resume-${resume.id}`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="bg-cyan-500/20 group-hover:bg-cyan-500/30 p-3 rounded-xl transition-colors shrink-0 border border-cyan-500/30">
                      <FileText className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white truncate max-w-[200px] sm:max-w-xs group-hover:text-cyan-300 transition-colors" data-testid={`text-filename-${resume.id}`}>
                        {resume.filename}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock className="h-3.5 w-3.5 text-gray-500" />
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(resume.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 shrink-0">
                    <div className="hidden sm:block">
                      <RiskBadge risk={resume.riskLevel} />
                    </div>
                    <div className="hidden sm:block">
                      <ScoreCircle score={resume.score} />
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Quick tip ── */}
      {total > 0 && (
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="show">
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-6 flex gap-4 items-start">
            <div className="bg-cyan-500/20 p-3 rounded-lg shrink-0 border border-cyan-500/30">
              <Zap className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="font-semibold text-white mb-1">Pro Tip: Aim for a score above 85</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Resumes scoring 85+ show minimal bias indicators. Use the AI suggestions in each report to improve language neutrality and create more inclusive job descriptions.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
