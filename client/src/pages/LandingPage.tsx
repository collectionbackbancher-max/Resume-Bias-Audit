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
  Quote,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }),
};

const floatingAnimation = {
  y: [0, -20, 0],
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
};

function MockReportCard() {
  return (
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="relative w-full max-w-sm mx-auto"
    >
      <div className="absolute inset-0 bg-cyan-500/20 rounded-3xl blur-3xl" />
      <div className="relative bg-gradient-to-br from-slate-900/90 to-black border border-cyan-500/30 rounded-2xl p-6 shadow-2xl shadow-cyan-500/20 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
            </div>
            <span className="text-sm font-semibold text-white">BiasAuditor Report</span>
          </div>
          <span className="text-xs text-gray-500">Just now</span>
        </div>

        <div className="flex items-center gap-4 mb-5">
          <div className="relative w-16 h-16 shrink-0">
            <svg width="64" height="64" className="-rotate-90">
              <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
              <motion.circle
                cx="32" cy="32" r="26" fill="none"
                stroke="#22d3ee" strokeWidth="4"
                strokeDasharray={163}
                initial={{ strokeDashoffset: 163 }}
                animate={{ strokeDashoffset: 163 * 0.18 }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-black text-cyan-400">82</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Fairness Score</p>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Low Risk
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium truncate max-w-[140px]">Senior_Engineer_CV.pdf</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Flags Detected</p>
          {[
            { type: "Gender Coding", phrase: "aggressive growth mindset", sev: "Moderate", color: "yellow" },
            { type: "Age Proxy", phrase: "digital native", sev: "Low", color: "emerald" },
          ].map((flag, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.2 }}
              className="flex items-start gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5"
            >
              <AlertTriangle className={`h-3 w-3 mt-0.5 shrink-0 ${flag.color === "yellow" ? "text-yellow-400" : "text-emerald-400"}`} />
              <div className="min-w-0">
                <p className="text-xs font-medium text-white">{flag.type}</p>
                <p className="text-xs text-gray-500 truncate">"{flag.phrase}"</p>
              </div>
              <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${
                flag.color === "yellow"
                  ? "bg-yellow-500/15 text-yellow-300 border-yellow-500/30"
                  : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
              }`}>
                {flag.sev}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          <p className="text-xs text-cyan-300 font-medium mb-0.5 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> AI Suggestion
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Replace "aggressive" with "results-driven" for more neutral, inclusive language.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

const testimonials = [
  {
    quote: "We cut time-to-hire by 30% and our team diversity improved dramatically after just two months of using BiasAuditor.",
    name: "Sarah Chen",
    title: "Head of People, TechCorp",
    stars: 5,
  },
  {
    quote: "The AI suggestions are incredibly actionable. Our hiring managers love how it guides rewrites in plain language.",
    name: "Marcus Reid",
    title: "Talent Lead, GrowthCo",
    stars: 5,
  },
  {
    quote: "Finally a tool that helps us walk the talk on DEI. The risk scores make bias visible and hard to ignore.",
    name: "Priya Nair",
    title: "VP Recruiting, ScaleUp",
    stars: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 w-full border-b border-cyan-500/20 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-display font-bold text-xl">
            <motion.div className="bg-cyan-500/20 p-2 rounded-xl" whileHover={{ scale: 1.1, rotate: 5 }}>
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
            </motion.div>
            <span className="text-white">BiasAuditor<span className="text-cyan-400">.ai</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <Link href="/pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link>
            <Link href="/blog" className="hover:text-cyan-400 transition-colors">Blog</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-white hover:bg-cyan-500/10">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="rounded-lg px-5 shadow-md shadow-cyan-500/30 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-black via-slate-950 to-black pt-16 pb-24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-10 right-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl"
            animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
            animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[580px]">
            {/* Left: copy */}
            <motion.div variants={fadeUp} initial="hidden" animate="show">
              <motion.div
                className="mb-8 inline-block"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <Badge className="rounded-lg px-5 py-2 text-sm font-medium bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 gap-2">
                  <Sparkles className="h-4 w-4" /> AI-Powered Bias Detection
                </Badge>
              </motion.div>

              <motion.h1
                className="text-6xl lg:text-7xl font-display font-black tracking-tighter leading-[1.02] mb-6 text-white"
                variants={fadeUp}
                custom={0.1}
              >
                <span className="bg-gradient-to-br from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent">
                  Hire for talent,
                </span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300">
                  not bias.
                </span>
              </motion.h1>

              <motion.p
                className="text-lg lg:text-xl text-gray-300 mb-10 max-w-xl leading-relaxed font-light"
                variants={fadeUp}
                custom={0.2}
              >
                Detect unconscious bias in resumes instantly. Our AI-powered platform analyzes gender-coded language, age proxies, and hidden bias markers to help you build{" "}
                <span className="text-cyan-300 font-semibold">fairer, smarter hiring</span>.
              </motion.p>

              <motion.div className="flex flex-col sm:flex-row gap-4 mb-10" variants={fadeUp} custom={0.3}>
                <Link href="/signup">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="h-13 px-8 rounded-xl text-base shadow-xl shadow-cyan-500/40 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black font-bold">
                      Start Auditing <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/pricing">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-13 px-8 rounded-xl text-base border-2 border-cyan-500/50 text-white hover:bg-cyan-500/20 font-semibold bg-transparent"
                    >
                      View Pricing
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>

              <motion.div className="flex flex-wrap gap-5" variants={fadeUp} custom={0.4}>
                {[
                  { icon: CheckCircle2, text: "No credit card needed" },
                  { icon: Zap, text: "Results in seconds" },
                  { icon: FileText, text: "PDF & DOCX support" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-cyan-500/15">
                      <item.icon className="h-4 w-4 text-cyan-400" />
                    </div>
                    <span className="text-sm text-gray-400 font-medium">{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: mock report card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:flex justify-center items-center"
            >
              <MockReportCard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-cyan-500/20 bg-gradient-to-r from-slate-950 via-black to-slate-950 py-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10k+", label: "Resumes Analyzed" },
              { value: "94%", label: "Accuracy" },
              { value: "150+", label: "Companies Trust Us" },
              { value: "2.1s", label: "Avg Scan Time" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="text-center group"
              >
                <motion.div
                  className="text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-1.5"
                  whileHover={{ scale: 1.08 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-28 container mx-auto px-6">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <h2 className="text-5xl lg:text-6xl font-display font-black mb-5 text-white">
            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">BiasAuditor</span> works
          </h2>
          <p className="text-xl text-gray-400">
            A three-step process to detect and eliminate bias from your hiring process
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: FileText,
              number: "01",
              title: "Upload Resume",
              desc: "Drop a PDF or DOCX. We instantly extract and analyze every word.",
              color: "from-blue-500 to-cyan-500",
            },
            {
              icon: Brain,
              number: "02",
              title: "AI Analysis",
              desc: "Our AI detects gender-coded language, age signals, and bias patterns across the full resume.",
              color: "from-cyan-500 to-blue-500",
            },
            {
              icon: TrendingUp,
              number: "03",
              title: "Get Score & Fix",
              desc: "Receive a fairness score and AI-generated suggestions for inclusive rewrites.",
              color: "from-blue-500 to-purple-500",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              whileHover={{ y: -10, transition: { duration: 0.25 } }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-gradient-to-br from-slate-900/60 to-black border border-cyan-500/20 rounded-2xl p-8 h-full hover:border-cyan-500/50 transition-colors">
                <div className="mb-6 flex items-start justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-5xl font-display font-black text-cyan-500/15 select-none">{feature.number}</span>
                </div>
                <h3 className="text-xl font-display font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Bias categories ── */}
      <section className="py-20 bg-gradient-to-b from-transparent via-slate-950/60 to-black border-y border-cyan-500/20">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-14"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-display font-black mb-4 text-white">Bias Categories Detected</h2>
            <p className="text-lg text-gray-400">Our AI catches subtle patterns humans miss</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, label: "Gender Coding", desc: "Masculine & feminine language patterns" },
              { icon: BarChart3, label: "Age Proxies", desc: "Graduation dates, 'digital native'" },
              { icon: AlertTriangle, label: "Exclusionary Terms", desc: "Gatekeeping & tribal language" },
              { icon: ShieldCheck, label: "Risk Scoring", desc: "Low / Moderate / High classification" },
            ].map((item, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                whileHover={{ scale: 1.04 }}
                className="bg-gradient-to-br from-slate-900/80 to-black border border-cyan-500/20 rounded-xl p-6 text-center hover:border-cyan-500/50 cursor-default transition-all group"
              >
                <div className="w-11 h-11 bg-gradient-to-br from-cyan-500/25 to-blue-500/25 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:from-cyan-500/40 group-hover:to-blue-500/40 transition-all">
                  <item.icon className="h-5 w-5 text-cyan-400" />
                </div>
                <h4 className="font-bold mb-2 text-white text-sm group-hover:text-cyan-300 transition-colors">{item.label}</h4>
                <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-28 container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-display font-black mb-4 text-white">
            Trusted by hiring teams <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">worldwide</span>
          </h2>
          <p className="text-lg text-gray-400">See what our customers say about fairer hiring</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              whileHover={{ y: -6, transition: { duration: 0.22 } }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-gradient-to-br from-slate-900/70 to-black border border-cyan-500/20 rounded-2xl p-7 h-full hover:border-cyan-500/40 transition-colors flex flex-col">
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-cyan-400 text-cyan-400" />
                  ))}
                </div>
                <Quote className="h-7 w-7 text-cyan-500/30 mb-3" />
                <p className="text-gray-300 leading-relaxed text-sm flex-1 mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center text-sm font-bold text-cyan-300 border border-cyan-500/20">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.title}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 container mx-auto px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-cyan-600 via-cyan-500 to-blue-600 p-16 text-center"
        >
          <motion.div
            className="absolute inset-0 bg-black/10"
            animate={{ opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-black/20 rounded-full translate-y-1/2 blur-3xl" />
          <div className="relative z-10">
            <motion.div animate={floatingAnimation} className="mb-6">
              <Sparkles className="h-12 w-12 mx-auto opacity-90 text-white" />
            </motion.div>
            <h2 className="text-5xl lg:text-6xl font-display font-black mb-5 text-white">
              Ready for fairer hiring?
            </h2>
            <p className="text-white/85 text-xl mb-10 max-w-xl mx-auto leading-relaxed">
              Join 150+ companies building diverse, high-performing teams with BiasAuditor
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="h-14 px-10 rounded-xl text-base font-bold shadow-xl bg-black hover:bg-slate-900 text-white">
                    Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/pricing">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" className="h-14 px-10 rounded-xl text-base font-bold border-2 border-white/40 text-white hover:bg-white/10 bg-transparent">
                    View Pricing
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-cyan-500/20 py-12 bg-black">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 font-display font-bold text-white mb-3">
                <ShieldCheck className="h-5 w-5 text-cyan-400" />
                BiasAuditor<span className="text-cyan-400">.ai</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">Fairer hiring for everyone, powered by AI.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link></li>
                <li><Link href="/pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link></li>
                <li><Link href="/blog" className="hover:text-cyan-400 transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/refund" className="hover:text-cyan-400 transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-cyan-500/20 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} BiasAuditor.ai — All rights reserved.</p>
            <div className="flex gap-6 text-gray-400">
              <a href="#" className="hover:text-cyan-400 transition-colors">Twitter</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
