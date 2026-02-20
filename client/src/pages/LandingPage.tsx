import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldCheck, FileText, BarChart, Zap, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2 font-display font-bold text-2xl">
          <div className="bg-primary/10 p-2 rounded-lg">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <span>BiasAuditor<span className="text-primary">.ai</span></span>
        </div>
        <Link href="/api/login">
          <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
            Get Started
          </Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-medium text-sm mb-6">
              <Zap className="h-4 w-4" /> AI-Powered Resume Analysis
            </div>
            <h1 className="text-5xl lg:text-7xl font-display font-bold tracking-tight leading-[1.1] mb-6">
              Hire Talent,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Not Bias.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Detect unconscious bias in resumes instantly. Our AI engine scans for age, gender, and racial bias markers to help you build diverse, high-performing teams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/api/login">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full">
                  Start Auditing Free
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full">
                View Sample Report
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-primary" /> No credit card required</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-primary" /> 99% Accuracy</span>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-[2rem] blur-2xl opacity-50" />
            <div className="relative bg-card border rounded-[2rem] shadow-2xl p-8 overflow-hidden">
              {/* Fake UI Interface */}
              <div className="flex items-center justify-between mb-8 border-b pb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="text-xs font-mono text-muted-foreground">analysis_report_v2.pdf</div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Fairness Score</h3>
                    <p className="text-muted-foreground">Based on industry standards</p>
                  </div>
                  <div className="text-4xl font-bold text-primary">92<span className="text-xl text-muted-foreground">/100</span></div>
                </div>

                <div className="space-y-3">
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full w-[92%] bg-primary rounded-full" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl">
                    <div className="text-red-600 font-semibold mb-1">Risk Level</div>
                    <div className="text-sm text-muted-foreground">Potential bias detected in language patterns</div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-xl">
                    <div className="text-green-600 font-semibold mb-1">Impact</div>
                    <div className="text-sm text-muted-foreground">Positive sentiment analysis confirmed</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-secondary/50 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Audit Your Resumes?</h2>
            <p className="text-muted-foreground text-lg">Unconscious bias creeps into hiring processes. Our tools help you spot it before it impacts your decisions.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: "Text Analysis",
                desc: "We analyze resume text for coded language that signals gender, age, or socioeconomic status."
              },
              {
                icon: BarChart,
                title: "Fairness Scoring",
                desc: "Get an objective score from 0-100 representing the neutrality of your candidate evaluation."
              },
              {
                icon: ShieldCheck,
                title: "Risk Assessment",
                desc: "Identify high-risk documents that may expose your organization to compliance issues."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="bg-background p-8 rounded-2xl border shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
