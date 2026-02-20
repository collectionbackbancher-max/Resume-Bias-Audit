import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useResume, useAnalyzeResume } from "@/hooks/use-resumes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Download, ChevronLeft, CheckCircle2, AlertTriangle, AlertOctagon, Printer } from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function Report() {
  const { id } = useParams();
  const resumeId = parseInt(id || "0");
  const { data: resume, isLoading, error } = useResume(resumeId);
  const analyzeMutation = useAnalyzeResume();

  useEffect(() => {
    if (resume && !resume.analysis && !analyzeMutation.isPending && !analyzeMutation.isSuccess) {
      analyzeMutation.mutate(resumeId);
    }
  }, [resume, analyzeMutation, resumeId]);

  if (isLoading || (resume && !resume.analysis && analyzeMutation.isPending)) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="text-2xl font-bold font-display">Analyzing Resume...</h2>
        <p className="text-muted-foreground max-w-md text-center">
          Our AI is scanning for bias markers, sentiment patterns, and fairness indicators.
        </p>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Failed to load report</h2>
        <Button className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const score = resume.score || 0;
  const riskLevel = resume.riskLevel || "Low";
  
  // Chart Data
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];
  
  const scoreColor = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 print:p-0 print:max-w-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold">{resume.filename}</h1>
            <p className="text-sm text-muted-foreground">Audit Report generated on {new Date(resume.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print Report
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Score Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-1">
          <Card className="h-full flex flex-col justify-center items-center p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-4">Fairness Score</h3>
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
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
            <div className="text-center mt-2">
              <p className="font-medium text-sm">
                {score >= 80 ? "Excellent Fairness" : score >= 60 ? "Needs Improvement" : "Critical Issues Found"}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Summary Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Executive Summary</CardTitle>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                  riskLevel === 'Low' ? 'bg-green-50 text-green-700 border-green-200' :
                  riskLevel === 'Moderate' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {riskLevel} Risk Level
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {resume.analysis?.summary || "No summary available."}
              </p>
              
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-3">Flagged Phrases</h4>
                <div className="flex flex-wrap gap-2">
                  {resume.analysis?.biasFlags.map((flag, i) => (
                    <div key={i} className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded border border-destructive/20 font-mono">
                      {flag.description.match(/"([^"]+)"/)?.[1] || flag.description}
                    </div>
                  ))}
                  {(!resume.analysis?.biasFlags || resume.analysis.biasFlags.length === 0) && (
                    <span className="text-xs text-muted-foreground italic">None detected</span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-secondary/50 p-4 rounded-xl">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Bias Flags Detected</div>
                  <div className="text-2xl font-bold">{resume.analysis?.biasFlags.length || 0}</div>
                </div>
                <div className="bg-secondary/50 p-4 rounded-xl">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Word Count</div>
                  <div className="text-2xl font-bold">{resume.rawText.split(/\s+/).length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Analysis */}
      <div>
        <h2 className="text-2xl font-bold font-display mb-6">Detailed Bias Analysis</h2>
        <div className="space-y-4">
          {resume.analysis?.biasFlags.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No significant bias detected</h3>
              <p className="text-muted-foreground">This resume appears to use neutral, inclusive language.</p>
            </Card>
          ) : (
            resume.analysis?.biasFlags.map((flag, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-l-4" style={{ 
                  borderLeftColor: flag.severity === 'High' ? '#ef4444' : flag.severity === 'Moderate' ? '#eab308' : '#22c55e' 
                }}>
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        {flag.severity === 'High' ? <AlertOctagon className="text-red-500 h-5 w-5" /> : 
                         flag.severity === 'Moderate' ? <AlertTriangle className="text-yellow-500 h-5 w-5" /> :
                         <AlertCircle className="text-blue-500 h-5 w-5" />}
                        <h3 className="font-semibold text-lg">{flag.category} Bias</h3>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${
                        flag.severity === 'High' ? 'bg-red-100 text-red-700' :
                        flag.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {flag.severity} Severity
                      </span>
                    </div>
                    
                    <p className="text-foreground/80 mb-4">{flag.description}</p>
                    
                    <div className="bg-secondary/50 p-4 rounded-lg border border-secondary">
                      <div className="text-sm font-semibold text-primary mb-1 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> Suggestion
                      </div>
                      <p className="text-sm text-muted-foreground">{flag.suggestion}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
