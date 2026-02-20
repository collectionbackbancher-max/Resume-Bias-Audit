import { useResumes } from "@/hooks/use-resumes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { FileText, Plus, ArrowRight, Loader2, AlertCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { data: resumes, isLoading, error } = useResumes();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Failed to load dashboard</h2>
        <p className="text-muted-foreground mb-4">Could not fetch your analysis history.</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const sortedResumes = resumes?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];
  const avgScore = resumes?.length 
    ? Math.round(resumes.reduce((acc, curr) => acc + (curr.score || 0), 0) / resumes.length) 
    : 0;

  const riskCounts = {
    Low: sortedResumes.filter(r => r.riskLevel === 'Low').length,
    Moderate: sortedResumes.filter(r => r.riskLevel === 'Moderate').length,
    High: sortedResumes.filter(r => r.riskLevel === 'High').length,
  };

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your bias audit activity</p>
        </div>
        <Link href="/upload">
          <Button size="lg" className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
            <Plus className="mr-2 h-4 w-4" /> New Audit
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{resumes?.length || 0}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Low Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{riskCounts.Low}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Moderate Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{riskCounts.Moderate}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">High Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{riskCounts.High}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Audits List */}
      <div>
        <h2 className="text-xl font-bold mb-4">Recent Audits</h2>
        {sortedResumes.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <div className="flex flex-col items-center">
              <div className="bg-secondary p-4 rounded-full mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No audits yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">Upload your first resume to check for unconscious bias and get actionable feedback.</p>
              <Link href="/upload">
                <Button>Start Your First Audit</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sortedResumes.map((resume, i) => (
              <motion.div 
                key={resume.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div 
                  onClick={() => setLocation(`/report/${resume.id}`)}
                  className="group bg-card hover:bg-accent/5 border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-secondary p-3 rounded-lg group-hover:bg-background transition-colors">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{resume.filename}</h3>
                      <p className="text-sm text-muted-foreground">
                        Analyzed {formatDistanceToNow(new Date(resume.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {resume.score !== null ? (
                      <div className="text-right hidden sm:block">
                        <div className="text-sm text-muted-foreground">Score</div>
                        <div className={`font-bold ${
                          (resume.score || 0) >= 80 ? 'text-green-600' : 
                          (resume.score || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {resume.score}/100
                        </div>
                      </div>
                    ) : (
                      <div className="hidden sm:block text-sm text-muted-foreground italic">Pending Analysis</div>
                    )}
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
