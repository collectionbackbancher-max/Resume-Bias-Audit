import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-cyan-500/20 bg-black/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-display font-bold text-xl">
            <div className="bg-cyan-500/20 p-2 rounded-xl">
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="text-white">BiasAuditor<span className="text-cyan-400">.ai</span></span>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-cyan-500/10 gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <h1 className="text-4xl font-display font-bold mb-2 text-white">Refund Policy</h1>
        <p className="text-gray-400 mb-12">Last updated: March 21, 2026</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Money-Back Guarantee</h2>
            <p>
              We offer a 14-day money-back guarantee on all paid plans. If you are not satisfied with BiasAuditor.ai, request a refund within 14 days of your purchase and we will refund your payment in full. No questions asked.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">How to Request a Refund</h2>
            <p>
              To request a refund, email our support team at <span className="text-cyan-400">support@biasauditor.ai</span> with your account email and order details. We will process your refund within 5-7 business days. The refund will be credited to your original payment method.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Cancellation</h2>
            <p>
              You can cancel your subscription at any time. Cancellation takes effect at the end of your current billing period. No refund is issued for partial months of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Questions?</h2>
            <p>
              If you have any questions about your refund or our policy, contact us at <span className="text-cyan-400">support@biasauditor.ai</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
