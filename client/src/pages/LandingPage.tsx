import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  FileText,
  BarChart3,
  Zap,
  CheckCircle2,
  ArrowRight,
  Users,
  Target,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Brain,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-display font-bold text-xl">
            <div className="bg-primary/10 p-2 rounded-xl">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <span>BiasAuditor<span className="text-primary">.ai</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="rounded-full px-5 shadow-md shadow-primary/20">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/8 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="container mx-auto px-6 pt-20 pb-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Copy */}
            <motion.div variants={fadeUp} initial="hidden" animate="show">
              <Badge className="mb-6 rounded-full px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20 gap-1.5 w-fit">
                <Sparkles className="h-3.5 w-3.5" /> AI-Powered Bias Detection
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-display font-bold tracking-tight leading-[1.08] mb-6 text-foreground">
                Hire for talent,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  not bias.
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-md leading-relaxed">
                Upload any resume and get an instant fairness score. Our AI engine spots gender-coded language, age proxies, and other hidden bias markers in seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link href="/signup">
                  <Button size="lg" className="h-12 px-7 rounded-full text-base shadow-lg shadow-primary/25">
                    Start Auditing Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="h-12 px-7 rounded-full text-base">
                  View Sample Report
                </Button>
              </div>
              <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
                {["No credit card needed", "Works on PDF & DOCX", "Results in seconds"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> {t}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right — Mockup card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[2.5rem] blur-3xl opacity-40" />
              <div className="relative bg-card border border-border/60 rounded-3xl shadow-2xl shadow-black/10 overflow-hidden">
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-5 py-4 border-b bg-secondary/30">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="text-xs font-mono text-muted-foreground bg-background/60 px-3 py-1 rounded-full">
                      candidate_resume.pdf — Analysis Complete
                    </div>
                  </div>
                </div>

                <div className="p-7 space-y-6">
                  {/* Score */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Fairness Score</p>
                      <div className="flex items-end gap-2">
                        <span className="text-5xl font-display font-bold text-primary">74</span>
                        <span className="text-muted-foreground pb-1.5 text-lg">/100</span>
                      </div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-yellow-200 dark:border-yellow-800 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" /> Moderate Risk
                    </div>
                  </div>

                  {/* Score bar */}
                  <div>
                    <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "74%" }}
                        transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {/* Flags */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Detected Flags</p>
                    {[
                      { label: "Gender-coded word: \"aggressive\"", color: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800" },
                      { label: "Age proxy: \"recent graduate\"", color: "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800" },
                      { label: "Coded language: \"rockstar\"", color: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" },
                    ].map((flag) => (
                      <div key={flag.label} className={`text-xs px-3 py-2 rounded-lg border font-medium ${flag.color}`}>
                        {flag.label}
                      </div>
                    ))}
                  </div>

                  {/* AI suggestion preview */}
                  <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold text-primary">AI Suggestion</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Replace <span className="font-semibold text-foreground">"aggressive go-getter"</span> → <span className="font-semibold text-primary">"results-driven professional"</span> to eliminate gender-coded framing.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y bg-secondary/30">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10k+", label: "Resumes Audited" },
              { value: "94%", label: "Accuracy Rate" },
              { value: "3s", label: "Average Scan Time" },
              { value: "12", label: "Bias Categories" },
            ].map((stat, i) => (
              <motion.div key={stat.label} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <div className="text-3xl font-display font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 container mx-auto px-6">
        <motion.div className="text-center max-w-2xl mx-auto mb-16" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <Badge className="mb-4 rounded-full px-4 py-1 bg-accent/10 text-accent border-accent/20">How It Works</Badge>
          <h2 className="text-4xl font-display font-bold mb-4">Bias-free hiring starts here</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Our multi-layer analysis catches what human reviewers miss — fast.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: FileText,
              color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
              title: "Upload & Extract",
              desc: "Drop a PDF or DOCX. We extract and clean the text automatically, preserving structure for accurate analysis.",
            },
            {
              icon: Target,
              color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
              title: "AI Bias Scan",
              desc: "Our engine checks for gender-coded language, age proxies, graduation year signals, and 12 other bias categories.",
            },
            {
              icon: TrendingUp,
              color: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
              title: "Score & Improve",
              desc: "Get a 0–100 fairness score, risk classification, and AI-written inclusive rewrites you can use immediately.",
            },
          ].map((feature, i) => (
            <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="group bg-card border border-border/60 rounded-2xl p-8 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.color}`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-display font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── What we detect ── */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-6">
          <motion.div className="text-center mb-14" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <h2 className="text-3xl font-display font-bold mb-3">What BiasAuditor detects</h2>
            <p className="text-muted-foreground">Comprehensive coverage across multiple bias dimensions</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, label: "Gender-coded language", desc: "Words that favor one gender" },
              { icon: BarChart3, label: "Age proxies", desc: "Graduation years, 'digital native'" },
              { icon: AlertTriangle, label: "Exclusionary language", desc: "Culture fit dog-whistles" },
              { icon: ShieldCheck, label: "Risk classification", desc: "Low / Moderate / High risk" },
            ].map((item, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="bg-card border border-border/60 rounded-2xl p-6 text-center hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-semibold mb-1 text-sm">{item.label}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 container mx-auto px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary to-accent p-12 text-center text-white"
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <ShieldCheck className="h-12 w-12 mx-auto mb-6 opacity-90" />
            <h2 className="text-4xl font-display font-bold mb-4">Ready for fairer hiring?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-md mx-auto">
              Join hiring teams who use BiasAuditor to build diverse, high-performing teams — one resume at a time.
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="h-12 px-8 rounded-full text-base font-semibold shadow-lg">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-display font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            BiasAuditor<span className="text-primary">.ai</span>
          </div>
          <p>© {new Date().getFullYear()} BiasAuditor.ai — Fairer hiring for everyone.</p>
        </div>
      </footer>
    </div>
  );
}
