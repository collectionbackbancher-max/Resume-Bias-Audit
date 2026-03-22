import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Paddle?: any;
  }
}

interface PaddleCheckoutProps {
  planName: "starter" | "team";
  buttonText?: string;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function PaddleCheckout({
  planName,
  buttonText,
  variant = "default",
  size = "lg",
  className = "",
}: PaddleCheckoutProps) {
  const { user } = useAuth();

  useEffect(() => {
    // Load Paddle script if not already loaded
    if (typeof window !== "undefined" && !window.Paddle) {
      const script = document.createElement("script");
      script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      script.async = true;
      script.onload = () => {
        if (window.Paddle) {
          console.log("[Paddle] Script loaded, initializing with token");
          window.Paddle.Setup({ token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN });
        }
      };
      script.onerror = () => {
        console.error("[Paddle] Failed to load Paddle script");
      };
      document.head.appendChild(script);
    }
  }, []);

  const handleCheckout = async () => {
    console.log("[Paddle] Checkout clicked", { planName, userEmail: user?.email });
    console.log("[Paddle] Window.Paddle:", window.Paddle);
    console.log("[Paddle] Env vars:", {
      token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN,
      starter: import.meta.env.VITE_PADDLE_PRICE_ID_STARTER,
      team: import.meta.env.VITE_PADDLE_PRICE_ID_TEAM,
    });

    if (!window.Paddle) {
      console.error("[Paddle] Paddle script not loaded");
      alert("Paddle payment system not ready. Please refresh the page.");
      return;
    }

    if (!user?.email) {
      console.error("[Paddle] User email missing", user);
      alert("Unable to retrieve your email. Please log in again.");
      return;
    }

    const priceId =
      planName === "starter"
        ? import.meta.env.VITE_PADDLE_PRICE_ID_STARTER
        : import.meta.env.VITE_PADDLE_PRICE_ID_TEAM;

    if (!priceId) {
      console.error("[Paddle] Price ID missing for plan:", planName);
      alert(`Price ID not configured for ${planName} plan`);
      return;
    }

    console.log("[Paddle] Opening checkout with:", { priceId, email: user.email, userId: user.id });

    try {
      window.Paddle.Checkout.open({
        items: [{ priceId }],
        customer: {
          email: user.email,
        },
        customData: {
          userId: user.id,
        },
      });
      console.log("[Paddle] Checkout opened successfully");
    } catch (err) {
      console.error("[Paddle] Checkout error:", err);
      alert("Failed to open checkout. Please try again.");
    }
  };

  const displayText = buttonText || `Upgrade to ${planName.charAt(0).toUpperCase() + planName.slice(1)}`;

  return (
    <Button
      onClick={handleCheckout}
      variant={variant}
      size={size}
      className={className}
      data-testid={`button-paddle-${planName}`}
    >
      {displayText}
    </Button>
  );
}
