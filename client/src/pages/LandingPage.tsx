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
  Zap as ZapIcon,
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
      <section className="relative overflow-hidden bg-gradient-to-b from-black via-slate-950 to-black pt-20 pb-40">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-10 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
            animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 left-10 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl"
            animate={{ x: [0, -80, 0], y: [0, -60, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-cyan-400 rounded-full opacity-30" />
          <motion.div
            className="absolute top-1/3 right-1/3 w-1 h-1 bg-cyan-300 rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <motion.div variants={fadeUp} initial="hidden" animate="show">
              <motion.div
                className="mb-8 inline-block"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Badge className="rounded-lg px-5 py-2 text-sm font-medium bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 gap-2">
                  <Sparkles className="h-4 w-4" /> AI-Powered Bias Detection
                </Badge>
              </motion.div>

              <motion.h1
                className="text-7xl lg:text-8xl font-display font-black tracking-tighter leading-[1] mb-8 text-white bg-gradient-to-br from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent"
                variants={fadeUp}
                custom={0.1}
              >
                Hire for talent,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 animate-pulse">
                  not bias.
                </span>
              </motion.h1>

              <motion.p
                className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-3xl leading-relaxed font-light"
                variants={fadeUp}
                custom={0.2}
              >
                Detect unconscious bias in resumes instantly. Our AI-powered platform analyzes gender-coded language, age proxies, and hidden bias markers to help you build <span className="text-cyan-300 font-semibold">fairer, smarter hiring</span>.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 mb-16"
                variants={fadeUp}
                custom={0.3}
              >
                <Link href="/signup">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="h-14 px-8 rounded-lg text-base shadow-xl shadow-cyan-500/50 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black font-bold text-lg">
                      Start Auditing <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 rounded-lg text-base border-2 border-cyan-500/50 text-white hover:bg-cyan-500/20 font-semibold bg-transparent"
                  >
                    Watch Demo
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                className="flex flex-wrap gap-6 md:gap-10"
                variants={fadeUp}
                custom={0.4}
              >
                {[
                  { icon: CheckCircle2, text: "No credit card needed" },
                  { icon: Zap, text: "Results in seconds" },
                  { icon: FileText, text: "Works on PDF & DOCX" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3"
                    whileHover={{ x: 8 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="p-2 rounded-lg bg-cyan-500/20">
                      <item.icon className="h-5 w-5 text-cyan-400" />
                    </div>
                    <span className="text-gray-400 font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-cyan-500/20 bg-gradient-to-r from-slate-950 via-black to-slate-950 py-12">
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
                  className="text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2"
                  whileHover={{ scale: 1.1 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-32 container mx-auto px-6">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-20"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <h2 className="text-5xl lg:text-6xl font-display font-black mb-6 text-white">
            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">BiasAuditor</span> works
          </h2>
          <p className="text-xl text-gray-400">
            A three-step process to detect and eliminate bias from your hiring process
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
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
              desc: "Our AI detects gender-coded language, age signals, and bias patterns.",
              color: "from-cyan-500 to-blue-500",
            },
            {
              icon: TrendingUp,
              number: "03",
              title: "Get Score",
              desc: "Receive a fairness score and AI suggestions for inclusive rewrites.",
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
              whileHover={{ y: -12, transition: { duration: 0.3 } }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-gradient-to-br from-slate-900/50 to-black border border-cyan-500/20 rounded-2xl p-8 h-full hover:border-cyan-500/50 transition-colors">
                <div className="mb-6 flex items-start justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-5xl font-display font-black text-cyan-500/20">{feature.number}</span>
                </div>
                <h3 className="text-2xl font-display font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── What we detect ── */}
      <section className="py-24 bg-gradient-to-b from-transparent via-slate-950/50 to-black border-y border-cyan-500/20">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
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
              { icon: Users, label: "Gender Coding", desc: "Masculine & feminine language" },
              { icon: BarChart3, label: "Age Proxies", desc: "Graduation dates, 'digital native'" },
              { icon: AlertTriangle, label: "Exclusionary Terms", desc: "Gatekeeping language" },
              { icon: ShieldCheck, label: "Risk Scoring", desc: "Low / Moderate / High risk" },
            ].map((item, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-slate-900/70 to-black border border-cyan-500/20 rounded-xl p-6 text-center hover:border-cyan-500/50 cursor-pointer transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:from-cyan-500/50 group-hover:to-blue-500/50 transition-all">
                  <item.icon className="h-6 w-6 text-cyan-400" />
                </div>
                <h4 className="font-bold mb-2 text-white group-hover:text-cyan-300 transition-colors">{item.label}</h4>
                <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 container mx-auto px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-cyan-600 via-cyan-500 to-blue-600 p-16 text-center group"
        >
          <motion.div
            className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"
            animate={{ opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <div className="relative z-10">
            <motion.div
              animate={floatingAnimation}
              className="mb-8"
            >
              <Sparkles className="h-14 w-14 mx-auto opacity-90 text-white" />
            </motion.div>
            <h2 className="text-5xl lg:text-6xl font-display font-black mb-6 text-white">
              Ready for fairer hiring?
            </h2>
            <p className="text-white/90 text-xl mb-10 max-w-xl mx-auto leading-relaxed">
              Join 150+ companies building diverse, high-performing teams with BiasAuditor
            </p>
            <Link href="/signup">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="h-14 px-10 rounded-lg text-base font-bold shadow-xl bg-black hover:bg-slate-900 text-white">
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-cyan-500/20 py-12 bg-black">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 font-display font-bold text-white mb-4">
                <ShieldCheck className="h-5 w-5 text-cyan-400" />
                BiasAuditor<span className="text-cyan-400">.ai</span>
              </div>
              <p className="text-sm text-gray-500">Fairer hiring for everyone.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link></li>
                <li><Link href="/pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Features</a></li>
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
