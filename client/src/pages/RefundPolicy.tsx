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
        <p className="text-gray-400 mb-12">Last updated: March 19, 2026</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Overview</h2>
            <p>
              At BiasAuditor.ai, we stand behind our product. We want you to be completely satisfied with your purchase. This refund policy outlines the terms and conditions under which refunds are issued.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Free Trial</h2>
            <p>
              BiasAuditor.ai offers a free trial that allows you to test our platform. No credit card is required to access the free trial. Once your trial period expires, you may choose to upgrade to a paid plan.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Refund Window</h2>
            <p>
              We offer a 30-day money-back guarantee for all paid plans. If you are not satisfied with BiasAuditor.ai within 30 days of your initial purchase, you may request a full refund by contacting our support team at support@biasauditor.ai.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Eligibility for Refunds</h2>
            <p>
              To be eligible for a refund:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your request must be submitted within 30 days of your purchase</li>
              <li>You must be the original account holder</li>
              <li>The refund request must not be fraudulent or abusive</li>
              <li>Your account must be in good standing (no violations of Terms of Service)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Refund Process</h2>
            <p>
              To request a refund, please:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Contact our support team at support@biasauditor.ai</li>
              <li>Provide your account email and order details</li>
              <li>Explain the reason for your refund request</li>
              <li>Our team will review and respond within 5-7 business days</li>
              <li>If approved, the refund will be processed to your original payment method within 3-5 business days</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Non-Refundable Items</h2>
            <p>
              The following are not eligible for refunds:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Requests submitted more than 30 days after purchase</li>
              <li>Refunds for partial months of service</li>
              <li>Refunds due to user error or misunderstanding of features</li>
              <li>Duplicate or fraudulent charges (disputed through your payment provider instead)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Account Cancellation</h2>
            <p>
              You may cancel your subscription at any time. Upon cancellation, you will lose access to paid features at the end of your billing period. Cancellation does not automatically trigger a refund unless within the 30-day refund window.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Disputes and Chargebacks</h2>
            <p>
              If you dispute a charge with your payment provider or credit card company, you may lose access to your BiasAuditor.ai account. We encourage you to contact our support team first to resolve any billing issues before initiating a chargeback.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about our refund policy, please contact us at:
            </p>
            <p className="mt-4">
              Email: support@biasauditor.ai<br/>
              Website: biasauditor.ai
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
