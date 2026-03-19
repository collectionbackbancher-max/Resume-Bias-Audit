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

      {/* ── Background Orbs ── */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl mix-blend-multiply filter" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl mix-blend-multiply filter" />

      {/* ── Hero Section ── */}
      <section className="container mx-auto px-6 py-24 relative z-10">
        <motion.div
          className="text-center max-w-4xl mx-auto mb-16"
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <motion.div
            className="inline-block mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="bg-cyan-500/20 border-cyan-500/30 text-cyan-300 px-4 py-1.5 rounded-full font-medium gap-2">
              <motion.div
                className="w-2 h-2 bg-cyan-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              AI-Powered Bias Detection
            </Badge>
          </motion.div>

          <h1 className="text-6xl lg:text-7xl font-display font-black text-white mb-6 leading-tight">
            Hire for talent,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              not bias.
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Detect unconscious bias in resumes instantly. Our AI-powered platform analyzes gender-coded language, age proxies, and hidden bias markers to help you build truly diverse teams.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link href="/signup">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="rounded-lg px-8 h-12 shadow-lg shadow-cyan-500/40 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold gap-2"
                >
                  Start Auditing Free <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="rounded-lg px-8 h-12 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 font-semibold"
              >
                View Demo
              </Button>
            </motion.div>
          </div>

          {/* Trust badges */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-6 text-sm text-gray-400"
            variants={fadeUp}
            custom={1}
            initial="hidden"
            animate="show"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-cyan-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-cyan-400" />
              <span>99% Accuracy Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-cyan-400" />
              <span>GDPR Compliant</span>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Features Section ── */}
        <motion.div
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto py-24"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {[
            {
              icon: Brain,
              title: "AI-Powered Analysis",
              description: "Advanced machine learning detects subtle bias patterns humans miss",
              color: "cyan",
            },
            {
              icon: BarChart3,
              title: "Comprehensive Scoring",
              description: "Get fairness scores, risk levels, and detailed bias breakdowns",
              color: "blue",
            },
            {
              icon: Target,
              title: "Actionable Insights",
              description: "Receive specific suggestions to improve resume language",
              color: "purple",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              className="bg-gradient-to-br from-slate-900/50 to-black border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/40 transition-all group"
            >
              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 w-fit mb-4 group-hover:bg-cyan-500/20 transition-colors">
                <feature.icon className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Stats Section ── */}
        <motion.div
          className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto py-16 border-t border-cyan-500/20"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {[
            { number: "10K+", label: "Resumes Analyzed" },
            { number: "99%", label: "Accuracy Rate" },
            { number: "50+", label: "Bias Markers Detected" },
            { number: "47%", label: "Avg Bias Reduction" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              className="text-center group cursor-pointer"
              whileHover={{ scale: 1.1 }}
            >
              <div className="text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2 group-hover:from-cyan-300 group-hover:to-blue-300 transition-all">
                {stat.number}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── CTA Section ── */}
        <motion.div
          className="max-w-3xl mx-auto mt-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-12 text-center"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-display font-bold text-white mb-4">Ready to build fairer teams?</h2>
          <p className="text-gray-400 mb-8">Start your free audit today and see how BiasAuditor.ai can help eliminate bias from your hiring process.</p>
          <Link href="/signup">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-lg px-8 h-12">
                Get Started Free →
              </Button>
            </motion.div>
          </Link>
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
                <li><Link href="/blog" className="hover:text-cyan-400 transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Support</a></li>
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
