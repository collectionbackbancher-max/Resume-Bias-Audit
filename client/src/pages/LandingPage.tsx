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
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 w-full border-b border-cyan-500/20 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-display font-bold text-xl">
            <div className="bg-cyan-500/20 p-2 rounded-xl">
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="text-white">BiasAuditor<span className="text-cyan-400">.ai</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-white hover:bg-cyan-500/10">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="rounded-full px-5 shadow-md shadow-cyan-500/30 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-black via-black to-slate-950">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="container mx-auto px-6 pt-24 pb-32">
          <div className="max-w-3xl">
            <motion.div variants={fadeUp} initial="hidden" animate="show">
              <Badge className="mb-6 rounded-full px-4 py-1.5 text-sm font-medium bg-cyan-500/20 text-cyan-300 border-cyan-500/40 gap-1.5 w-fit">
                <Sparkles className="h-3.5 w-3.5" /> AI-Powered Bias Detection
              </Badge>
              <h1 className="text-6xl lg:text-7xl font-display font-bold tracking-tight leading-[1.1] mb-8 text-white">
                Hire for talent,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  not bias.
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-12 max-w-2xl leading-relaxed">
                Detect unconscious bias in resumes instantly. Our AI-powered platform analyzes gender-coded language, age proxies, and hidden bias markers to help you build fairer hiring processes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/signup">
                  <Button size="lg" className="h-14 px-8 rounded-lg text-base shadow-lg shadow-cyan-500/40 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="h-14 px-8 rounded-lg text-base border-cyan-500/40 text-white hover:bg-cyan-500/10 font-medium">
                  Learn More
                </Button>
              </div>
              <div className="flex flex-wrap gap-8 text-sm text-gray-400">
                {["No credit card needed", "Works on PDF & DOCX", "Results in seconds"].map((t) => (
                  <span key={t} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0" /> {t}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-cyan-500/20 bg-slate-950/50">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10k+", label: "Resumes Audited" },
              { value: "94%", label: "Accuracy Rate" },
              { value: "3s", label: "Average Scan Time" },
              { value: "12", label: "Bias Categories" },
            ].map((stat, i) => (
              <motion.div key={stat.label} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <div className="text-3xl font-display font-bold text-cyan-400">{stat.value}</div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 container mx-auto px-6">
        <motion.div className="text-center max-w-2xl mx-auto mb-16" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <Badge className="mb-4 rounded-full px-4 py-1 bg-blue-500/20 text-blue-300 border-blue-500/40">How It Works</Badge>
          <h2 className="text-4xl font-display font-bold mb-4 text-white">Bias-free hiring starts here</h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Our multi-layer analysis catches what human reviewers miss — fast.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: FileText,
              color: "bg-blue-500/20 text-blue-400",
              title: "Upload & Extract",
              desc: "Drop a PDF or DOCX. We extract and clean the text automatically, preserving structure for accurate analysis.",
            },
            {
              icon: Target,
              color: "bg-cyan-500/20 text-cyan-400",
              title: "AI Bias Scan",
              desc: "Our engine checks for gender-coded language, age proxies, graduation year signals, and 12 other bias categories.",
            },
            {
              icon: TrendingUp,
              color: "bg-emerald-500/20 text-emerald-400",
              title: "Score & Improve",
              desc: "Get a 0–100 fairness score, risk classification, and AI-written inclusive rewrites you can use immediately.",
            },
          ].map((feature, i) => (
            <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="group bg-slate-900 border border-cyan-500/20 rounded-2xl p-8 hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.color}`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-display font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── What we detect ── */}
      <section className="py-20 bg-slate-950/50 border-y border-cyan-500/20">
        <div className="container mx-auto px-6">
          <motion.div className="text-center mb-14" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <h2 className="text-3xl font-display font-bold mb-3 text-white">What BiasAuditor detects</h2>
            <p className="text-gray-400">Comprehensive coverage across multiple bias dimensions</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, label: "Gender-coded language", desc: "Words that favor one gender" },
              { icon: BarChart3, label: "Age proxies", desc: "Graduation years, 'digital native'" },
              { icon: AlertTriangle, label: "Exclusionary language", desc: "Culture fit dog-whistles" },
              { icon: ShieldCheck, label: "Risk classification", desc: "Low / Moderate / High risk" },
            ].map((item, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="bg-slate-900 border border-cyan-500/20 rounded-2xl p-6 text-center hover:border-cyan-500/50 transition-colors"
              >
                <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-5 w-5 text-cyan-400" />
                </div>
                <h4 className="font-semibold mb-1 text-sm text-white">{item.label}</h4>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 container mx-auto px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-cyan-600 via-cyan-500 to-blue-600 p-12 text-center"
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <ShieldCheck className="h-12 w-12 mx-auto mb-6 opacity-90 text-white" />
            <h2 className="text-4xl font-display font-bold mb-4 text-white">Ready for fairer hiring?</h2>
            <p className="text-white/90 text-lg mb-8 max-w-md mx-auto">
              Join hiring teams who use BiasAuditor to build diverse, high-performing teams — one resume at a time.
            </p>
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 rounded-full text-base font-semibold shadow-lg bg-black hover:bg-slate-900 text-white">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-cyan-500/20 py-8 bg-black">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2 font-display font-semibold text-white">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            BiasAuditor<span className="text-cyan-400">.ai</span>
          </div>
          <p>© {new Date().getFullYear()} BiasAuditor.ai — Fairer hiring for everyone.</p>
        </div>
      </footer>
    </div>
  );
}
