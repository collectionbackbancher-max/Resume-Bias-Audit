import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Paddle?: any;
  }
}

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter — $9/month",
  team: "Team — $29/month",
};

export default function Checkout() {
  const params = useParams<{ plan: string }>();
  const plan = params.plan as "starter" | "team";
  const [, navigate] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const priceId =
      plan === "starter"
        ? import.meta.env.VITE_PADDLE_PRICE_ID_STARTER
        : import.meta.env.VITE_PADDLE_PRICE_ID_TEAM;

    const search = new URLSearchParams(window.location.search);
    const email = search.get("email") || "";

    if (!priceId) {
      setStatus("error");
      setErrorMsg("Invalid plan. Please go back and try again.");
      return;
    }

    const initPaddle = () => {
      if (!window.Paddle) {
        setStatus("error");
        setErrorMsg("Payment system failed to load.");
        return;
      }

      try {
        window.Paddle.Setup({
          token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN,
          eventCallback: (event: any) => {
            if (event.name === "checkout.completed") {
              navigate("/");
            }
          },
        });

        const opts: any = {
          items: [{ priceId, quantity: 1 }],
          settings: {
            displayMode: "inline",
            theme: "dark",
            locale: "en",
            frameTarget: "paddle-checkout-container",
            frameInitialHeight: 450,
            frameStyle:
              "width: 100%; min-width: 312px; background-color: transparent; border: none;",
          },
        };

        if (email) {
          opts.customer = { email };
        }

        setStatus("ready");
        window.Paddle.Checkout.open(opts);
      } catch (err: any) {
        console.error("[Paddle] init error:", err);
        setStatus("error");
        setErrorMsg(err?.message || "Failed to start checkout.");
      }
    };

    if (window.Paddle) {
      initPaddle();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      script.async = true;
      script.onload = initPaddle;
      script.onerror = () => {
        setStatus("error");
        setErrorMsg("Failed to load payment system. Check your connection.");
      };
      document.head.appendChild(script);
    }
  }, [plan]);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="border-b border-cyan-500/20 px-6 py-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/pricing")}
          className="text-slate-400 hover:text-white gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pricing
        </Button>
        <span className="text-white font-semibold">
          Upgrade to{" "}
          <span className="text-cyan-400">
            {plan.charAt(0).toUpperCase() + plan.slice(1)}
          </span>
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-start pt-10 px-4">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 py-20">
            <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
            <p className="text-slate-400">Loading secure checkout…</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 py-20">
            <p className="text-red-400 text-base">{errorMsg}</p>
            <Button
              variant="outline"
              onClick={() => navigate("/pricing")}
              className="border-cyan-500/30 text-cyan-400"
            >
              ← Back to Pricing
            </Button>
          </div>
        )}

        {/* Paddle renders its inline iframe into this div */}
        <div
          className="paddle-checkout-container w-full max-w-xl"
          style={{ minHeight: 450 }}
          ref={containerRef}
        />
      </div>
    </div>
  );
}
