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
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.08 } }),
};

function RiskBadge({ risk }: { risk: string | null }) {
  if (!risk) return <Badge variant="secondary" className="text-xs">Pending</Badge>;
  const styles: Record<string, string> = {
    Low: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    Moderate: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    High: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${styles[risk] || styles.Moderate}`}>
      {risk} Risk
    </span>
  );
}

function ScoreCircle({ score }: { score: number | null }) {
  if (score === null) return <span className="text-sm text-muted-foreground italic">—</span>;
  const color = score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-600";
  return (
    <div className="text-right">
      <div className={`text-xl font-display font-bold ${color}`}>{score}</div>
      <div className="text-xs text-muted-foreground">/ 100</div>
    </div>
  );
}

export default function Dashboard() {
  const { data: resumes, isLoading, error } = useResumes();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your audits…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-xl font-bold mb-2">Failed to load dashboard</h2>
        <p className="text-muted-foreground mb-6">Could not fetch your analysis history.</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
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
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
        <div>
          <h1 className="text-3xl font-display font-bold">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Here's an overview of your bias audit activity.</p>
        </div>
        <Link href="/upload">
          <Button
            size="lg"
            className="rounded-full shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all gap-2"
            data-testid="button-new-audit"
          >
            <Plus className="h-4 w-4" /> New Audit
          </Button>
        </Link>
      </div>

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Scans",
            value: total,
            icon: FileText,
            iconClass: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
            valueClass: "text-foreground",
            delay: 0,
          },
          {
            label: "Avg. Fairness Score",
            value: avgScore !== null ? `${avgScore}/100` : "—",
            icon: TrendingUp,
            iconClass: "bg-primary/10 text-primary",
            valueClass: avgScore !== null ? (avgScore >= 80 ? "text-green-600" : avgScore >= 60 ? "text-yellow-600" : "text-red-600") : "text-foreground",
            delay: 1,
          },
          {
            label: "Low Risk",
            value: riskCounts.Low,
            icon: CheckCircle2,
            iconClass: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
            valueClass: "text-green-600 dark:text-green-400",
            delay: 2,
          },
          {
            label: "High Risk",
            value: riskCounts.High,
            icon: AlertTriangle,
            iconClass: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
            valueClass: riskCounts.High > 0 ? "text-red-600 dark:text-red-400" : "text-foreground",
            delay: 3,
          },
        ].map((stat) => (
          <motion.div key={stat.label} custom={stat.delay} variants={fadeUp} initial="hidden" animate="show">
            <Card className="hover:shadow-md transition-shadow border-border/60">
              <CardContent className="p-5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.iconClass}`}>
                  <stat.icon className="h-4.5 w-4.5" />
                </div>
                <div className={`text-2xl font-display font-bold ${stat.valueClass}`}>{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Risk breakdown bar ── */}
      {total > 0 && (
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Risk Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Low Risk", count: riskCounts.Low, color: "bg-green-500", text: "text-green-600 dark:text-green-400" },
                { label: "Moderate Risk", count: riskCounts.Moderate, color: "bg-yellow-500", text: "text-yellow-600 dark:text-yellow-400" },
                { label: "High Risk", count: riskCounts.High, color: "bg-red-500", text: "text-red-600 dark:text-red-400" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-28 shrink-0">{item.label}</span>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${item.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: total > 0 ? `${(item.count / total) * 100}%` : "0%" }}
                      transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    />
                  </div>
                  <span className={`text-sm font-semibold w-8 text-right ${item.text}`}>{item.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Recent Audits ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold">Recent Audits</h2>
          {sortedResumes.length > 5 && (
            <Button variant="ghost" size="sm" className="text-primary gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {sortedResumes.length === 0 ? (
          <Card className="border-dashed border-2 border-border/60">
            <CardContent className="py-16 flex flex-col items-center text-center">
              <div className="bg-secondary p-5 rounded-2xl mb-5">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-display font-bold mb-2">No audits yet</h3>
              <p className="text-muted-foreground mb-6 max-w-xs text-sm leading-relaxed">
                Upload your first resume to start detecting unconscious bias and get actionable AI suggestions.
              </p>
              <Link href="/upload">
                <Button className="rounded-full gap-2" data-testid="button-first-audit">
                  <Plus className="h-4 w-4" /> Start Your First Audit
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {sortedResumes.map((resume, i) => (
              <motion.div key={resume.id} custom={i} variants={fadeUp} initial="hidden" animate="show">
                <div
                  onClick={() => setLocation(`/report/${resume.id}`)}
                  className="group bg-card hover:bg-accent/5 border border-border/60 rounded-2xl px-5 py-4 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-200"
                  data-testid={`card-resume-${resume.id}`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="bg-primary/10 group-hover:bg-primary/15 p-2.5 rounded-xl transition-colors shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate max-w-[200px] sm:max-w-xs" data-testid={`text-filename-${resume.id}`}>
                        {resume.filename}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
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
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
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
          <Card className="bg-primary/5 border-primary/15">
            <CardContent className="p-5 flex gap-4 items-start">
              <div className="bg-primary/10 p-2.5 rounded-xl shrink-0">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-0.5">Tip: Aim for a score above 85</p>
                <p className="text-sm text-muted-foreground">
                  Resumes scoring 85+ show minimal bias indicators. Use the AI suggestions in each report to improve language neutrality.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
