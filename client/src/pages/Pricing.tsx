import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.1 } }),
};

export default function Pricing() {
  const { user } = useAuth();

  const plans = [
    {
      name: "Free",
      price: 0,
      description: "Get started with bias detection",
      cta: "Get Started",
      features: [
        "5 scans/month",
        "Single file uploads",
        "Bias detection & scoring",
        "AI suggestions",
        "Basic reports",
      ],
      notIncluded: [
        "Bulk uploads",
        "PDF downloads",
        "ATS integrations",
        "Priority processing",
      ],
      popular: false,
    },
    {
      name: "Starter",
      price: 9,
      description: "Perfect for small teams",
      cta: "Upgrade to Starter",
      features: [
        "100 scans/month",
        "Bulk uploads (up to 10 files)",
        "All Free features",
        "PDF downloads",
        "Analytics dashboard",
        "ATS integrations",
      ],
      notIncluded: [
        "Priority processing",
      ],
      popular: true,
    },
    {
      name: "Team",
      price: 29,
      description: "For larger organizations",
      cta: "Upgrade to Team",
      features: [
        "500 scans/month",
        "Bulk uploads (up to 10 files)",
        "All Starter features",
        "ATS integrations",
        "Priority processing",
        "Custom integrations",
        "Team management",
      ],
      notIncluded: [],
      popular: false,
    },
  ];

  return (
    <div className={user ? "" : "min-h-screen bg-black text-white overflow-x-hidden"}>
      {/* ── Standalone nav — only shown when NOT logged in ── */}
      {!user && (
        <div className="sticky top-0 z-50 border-b border-cyan-500/20 bg-black/80 backdrop-blur-xl">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2.5 font-display font-bold text-xl cursor-pointer hover:opacity-80 transition">
                <div className="bg-cyan-500/20 p-2 rounded-xl">
                  <ShieldCheck className="h-5 w-5 text-cyan-400" />
                </div>
                <span className="text-white">BiasAuditor<span className="text-cyan-400">.ai</span></span>
              </div>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-cyan-500/10">Back</Button>
            </Link>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="container mx-auto px-6 py-16">
        {/* ── Header ── */}
        <motion.div className="text-center max-w-3xl mx-auto mb-16" variants={fadeUp} initial="hidden" animate="show">
          <h1 className="text-5xl lg:text-6xl font-display font-black text-white mb-6">
            Simple, transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">pricing</span>
          </h1>
          <p className="text-xl text-gray-400">Choose the plan that's right for your hiring needs. Upgrade anytime.</p>
        </motion.div>

        {/* ── Plans ── */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className={`relative rounded-2xl transition-all duration-300 ${
                plan.popular ? "md:scale-105 md:ring-2 md:ring-cyan-500" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className={`h-full p-8 rounded-2xl border backdrop-blur transition-all ${
                plan.popular
                  ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border-cyan-500/50"
                  : "bg-gradient-to-br from-slate-900/50 to-black border-cyan-500/20 hover:border-cyan-500/40"
              }`}>
                {/* Name & Price */}
                <div className="mb-8">
                  <h3 className="text-2xl font-display font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-6">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-5xl font-display font-bold ${plan.popular ? "text-cyan-400" : "text-white"}`}>
                      ${plan.price}
                    </span>
                    {plan.price > 0 && <span className="text-gray-500">/month</span>}
                  </div>
                  {plan.price === 0 && <p className="text-gray-500 mt-2">Forever free</p>}
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  <div className="space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-emerald-400 shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.notIncluded.length > 0 && (
                    <div className="pt-4 border-t border-gray-700/50 space-y-2">
                      {plan.notIncluded.map((feature) => (
                        <div key={feature} className="flex items-center gap-3 opacity-50">
                          <div className="h-5 w-5 rounded border border-gray-600" />
                          <span className="text-gray-500 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* CTA */}
                <Link href={plan.price === 0 ? "/signup" : user ? "/" : "/signup"}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
                    <Button
                      size="lg"
                      className={`w-full rounded-lg font-semibold h-12 ${
                        plan.popular
                          ? "bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black"
                          : "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── FAQ ── */}
        <motion.div className="max-w-3xl mx-auto mt-24" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <h2 className="text-3xl font-display font-bold text-white mb-12 text-center">Questions?</h2>
          <div className="space-y-6">
            {[
              {
                q: "Can I change plans anytime?",
                a: "Yes! Upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                q: "What happens to my scans when I downgrade?",
                a: "Your scan history remains intact. Your monthly scan limit will reset to your new plan's limit.",
              },
              {
                q: "Do you offer refunds?",
                a: "Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.",
              },
              {
                q: "What if I need more scans?",
                a: "Contact us at support@biasauditor.ai for custom enterprise plans.",
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                className="bg-gradient-to-br from-slate-900/50 to-black border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/40 transition-colors"
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
