import { useState } from "react";
import { useParams, Link } from "wouter";
import { useResume } from "@/hooks/use-resumes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Download, ChevronLeft, CheckCircle2, AlertTriangle,
  AlertOctagon, Printer, AlertCircle, ToggleLeft, ToggleRight,
  User, Briefcase, GraduationCap, Code, FileText, FolderOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { BiasHeatmap } from "@/components/BiasHeatmap";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";

// ── Section icon map ──────────────────────────────────────────────────────────
const SECTION_ICONS: Record<string, React.ReactNode> = {
  name:       <User className="h-4 w-4" />,
  summary:    <FileText className="h-4 w-4" />,
  experience: <Briefcase className="h-4 w-4" />,
  education:  <GraduationCap className="h-4 w-4" />,
  skills:     <Code className="h-4 w-4" />,
  projects:   <FolderOpen className="h-4 w-4" />,
  other:      <FileText className="h-4 w-4" />,
};

// ── Severity helpers ──────────────────────────────────────────────────────────
function severityColor(s: string) {
  if (s === "High")     return { border: "#ef4444", badge: "bg-red-100 text-red-700",    icon: <AlertOctagon className="text-red-500 h-5 w-5" /> };
  if (s === "Moderate") return { border: "#eab308", badge: "bg-yellow-100 text-yellow-700", icon: <AlertTriangle className="text-yellow-500 h-5 w-5" /> };
  return                         { border: "#3b82f6", badge: "bg-blue-100 text-blue-700",   icon: <AlertCircle className="text-blue-500 h-5 w-5" /> };
}

function categoryBadge(cat: string) {
  if (cat === "gender")   return "bg-purple-100 text-purple-700 border-purple-200";
  if (cat === "age")      return "bg-orange-100 text-orange-700 border-orange-200";
  return                         "bg-slate-100 text-slate-700 border-slate-200";
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Report() {
  const { id } = useParams();
  const resumeId = parseInt(id || "0");
  const { data: resume, isLoading, error } = useResume(resumeId);
  const [showClean, setShowClean] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="text-2xl font-bold font-display">Loading Report…</h2>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold">Failed to load report</h2>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const score     = resume.score ?? 0;
  const riskLevel = resume.riskLevel || "Low";
  const flags     = (resume.analysis as any)?.biasFlags ?? [];
  const scores    = (resume.analysis as any)?.scores;
  const sections  = (resume as any).sections;
  const cleanText = (resume as any).cleanText;
  const rawText   = resume.resumeText || "";
  const displayText = showClean && cleanText ? cleanText : rawText;

  const scoreColor = score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444";
  const chartData  = [{ name: "Score", value: score }, { name: "Remaining", value: 100 - score }];

  // ── Annotated text ──────────────────────────────────────────────────────────
  const AnnotatedText = ({ text }: { text: string }) => {
    let html = text.replace(/\n/g, "<br/>");
    flags.forEach((flag: any) => {
      const phrase = flag.phrase || flag.description?.match(/"([^"]+)"/)?.[1];
      if (!phrase || phrase.includes("+")) return;
      const esc = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const color =
        flag.severity === "High"     ? "bg-red-200/60 border-red-400"
        : flag.severity === "Moderate" ? "bg-yellow-200/60 border-yellow-400"
        : "bg-blue-200/60 border-blue-300";
      html = html.replace(
        new RegExp(`(${esc})`, "gi"),
        `<mark class="${color} rounded px-0.5 border-b-2 text-inherit" title="${flag.description}">$1</mark>`
      );
    });
    return <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  // ── Structured sections panel ───────────────────────────────────────────────
  const SectionsPanel = () => {
    if (!sections) return null;
    const entries: Array<{ key: string; label: string; value: string | string[] }> = [
      { key: "name",       label: "Candidate Name",  value: sections.name },
      { key: "summary",    label: "Summary",         value: sections.summary },
      { key: "skills",     label: "Skills",          value: sections.skills },
      { key: "experience", label: "Experience",      value: sections.experience },
      { key: "education",  label: "Education",       value: sections.education },
      { key: "projects",   label: "Projects",        value: sections.projects },
      { key: "other",      label: "Other",           value: sections.other },
    ].filter(e => {
      if (Array.isArray(e.value)) return e.value.length > 0;
      return !!e.value;
    });

    if (entries.length === 0) return null;

    return (
      <div className="space-y-4">
        {entries.map(({ key, label, value }) => (
          <div key={key} className="rounded-xl border bg-secondary/30 p-4">
            <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {SECTION_ICONS[key]}
              {label}
            </div>
            {Array.isArray(value) ? (
              key === "skills" ? (
                <div className="flex flex-wrap gap-1.5">
                  {value.map((s, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {value.map((item, i) => (
                    <li key={i} className="text-sm text-foreground/80 flex gap-2">
                      <span className="text-primary shrink-0 mt-0.5">·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <p className="text-sm text-foreground/80">{value}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 print:p-0 print:max-w-none">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon"><ChevronLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold">{resume.filename}</h1>
            <p className="text-sm text-muted-foreground">
              Report · {new Date(resume.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button onClick={() => window.location.href = `/api/generate-report/${resume.id}`}>
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      {/* ── Score + Summary ── */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-4">Fairness Score</h3>
            <div className="relative w-44 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={56} outerRadius={76}
                    startAngle={90} endAngle={-270} paddingAngle={0} dataKey="value" stroke="none">
                    <Cell fill={scoreColor} />
                    <Cell fill="#f3f4f6" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-4xl font-bold" style={{ color: scoreColor }}>{score}</span>
                <span className="text-xs text-muted-foreground">/100</span>
              </div>
            </div>
            <p className="font-medium text-sm mt-2 text-center">
              {score >= 80 ? "Excellent Fairness" : score >= 60 ? "Needs Improvement" : "Critical Issues Found"}
            </p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Executive Summary</CardTitle>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                  riskLevel === "Low"      ? "bg-green-50 text-green-700 border-green-200"
                  : riskLevel === "Moderate" ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                  : "bg-red-50 text-red-700 border-red-200"
                }`}>{riskLevel} Risk</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {(resume.analysis as any)?.summary || "No summary available."}
              </p>
              <div className="mt-5">
                <h4 className="text-sm font-semibold mb-2">Flagged Phrases</h4>
                <div className="flex flex-wrap gap-2">
                  {flags.length > 0 ? flags.map((f: any, i: number) => (
                    <span key={i} className={`px-2 py-0.5 text-xs rounded border font-mono ${categoryBadge(f.category)}`}>
                      {f.phrase || f.description?.match(/"([^"]+)"/)?.[1] || f.description}
                    </span>
                  )) : (
                    <span className="text-xs text-muted-foreground italic">None detected</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-secondary/50 p-4 rounded-xl">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Flags Detected</div>
                  <div className="text-2xl font-bold">{flags.length}</div>
                </div>
                <div className="bg-secondary/50 p-4 rounded-xl">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Word Count</div>
                  <div className="text-2xl font-bold">{(rawText || "").split(/\s+/).filter(Boolean).length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Main content ── */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">

          {/* Score breakdown */}
          <div>
            <h2 className="text-xl font-bold font-display mb-4">Score Breakdown</h2>
            <Card>
              <CardContent className="pt-6">
                <ScoreBreakdown scores={scores || { language: score, age: 100, name: 100 }} />
              </CardContent>
            </Card>
          </div>

          {/* Risk heatmap */}
          <div>
            <h2 className="text-xl font-bold font-display mb-4">Risk Heatmap</h2>
            <BiasHeatmap text={rawText} flags={flags} />
            <p className="text-xs text-muted-foreground mt-2">Bias density across the document.</p>
          </div>

          {/* Annotated resume with raw/clean toggle */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-display">Annotated Resume</h2>
              {cleanText && cleanText !== rawText && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClean(!showClean)}
                  className="gap-2 text-sm"
                  data-testid="button-toggle-clean"
                >
                  {showClean
                    ? <><ToggleRight className="h-4 w-4 text-primary" /> Cleaned text</>
                    : <><ToggleLeft className="h-4 w-4" /> Raw text</>}
                </Button>
              )}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={showClean ? "clean" : "raw"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Card>
                  <CardContent className="pt-6 font-mono text-sm leading-relaxed max-h-[500px] overflow-y-auto">
                    <AnnotatedText text={displayText} />
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
            {cleanText && cleanText !== rawText && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                {showClean
                  ? "Showing AI-cleaned text (OCR artifacts removed)."
                  : "Showing original extracted text. Toggle to see cleaned version."}
              </p>
            )}
          </div>

          {/* Structured sections */}
          {sections && (
            <div>
              <h2 className="text-xl font-bold font-display mb-4">Parsed Sections</h2>
              <SectionsPanel />
            </div>
          )}

          {/* Detailed flag analysis */}
          <div>
            <h2 className="text-xl font-bold font-display mb-4">Detailed Bias Analysis</h2>
            {flags.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No significant bias detected</h3>
                <p className="text-muted-foreground">This resume uses neutral, inclusive language.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {flags.map((flag: any, i: number) => {
                  const { border, badge, icon } = severityColor(flag.severity || "Low");
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="overflow-hidden border-l-4" style={{ borderLeftColor: border }}>
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex items-center gap-2">
                              {icon}
                              <h3 className="font-semibold text-base capitalize">
                                {flag.category || "General"} Bias
                              </h3>
                              {flag.section && flag.section !== "resume" && (
                                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded capitalize">
                                  {flag.section}
                                </span>
                              )}
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${badge}`}>
                              {flag.severity || "Low"}
                            </span>
                          </div>

                          <p className="text-foreground/80 text-sm mb-1">{flag.description}</p>
                          {flag.context && flag.phrase && !flag.phrase.includes("+") && (
                            <p className="text-xs text-muted-foreground font-mono mb-3 bg-secondary/50 px-2 py-1 rounded">
                              {flag.context}
                            </p>
                          )}

                          <div className="bg-secondary/50 p-3 rounded-lg border border-secondary">
                            <div className="text-xs font-semibold text-primary mb-1 flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Suggestion
                            </div>
                            <p className="text-sm text-muted-foreground">{flag.suggestion}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Bias Category Legend</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="flex items-start gap-2">
                <span className="px-2 py-0.5 rounded border text-xs font-medium bg-purple-100 text-purple-700 border-purple-200 shrink-0">gender</span>
                <p className="text-muted-foreground">Masculine or feminine-coded words that may unconsciously filter candidates.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="px-2 py-0.5 rounded border text-xs font-medium bg-orange-100 text-orange-700 border-orange-200 shrink-0">age</span>
                <p className="text-muted-foreground">Proxies that imply a preferred age range or career stage.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="px-2 py-0.5 rounded border text-xs font-medium bg-slate-100 text-slate-700 border-slate-200 shrink-0">language</span>
                <p className="text-muted-foreground">Intersection signals or compound bias patterns.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Audit Insights</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>Bias in Experience and Summary sections is weighted higher than in Skills.</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <p>Context matters — the same word may score differently depending on surrounding phrases.</p>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                <p>Intersection signals (e.g., age + leadership language combined) are flagged at higher severity.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
