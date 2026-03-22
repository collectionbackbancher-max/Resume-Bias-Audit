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
  size = "default",
  className = "",
}: PaddleCheckoutProps) {
  const { user } = useAuth();

  useEffect(() => {
    // Load Paddle script
    if (!window.Paddle) {
      const script = document.createElement("script");
      script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      script.async = true;
      script.onload = () => {
        if (window.Paddle) {
          window.Paddle.Setup({ token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN });
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  const handleCheckout = async () => {
    if (!window.Paddle || !user?.email) {
      alert("Unable to open checkout. Please try again.");
      return;
    }

    const priceId =
      planName === "starter"
        ? import.meta.env.VITE_PADDLE_PRICE_ID_STARTER
        : import.meta.env.VITE_PADDLE_PRICE_ID_TEAM;

    window.Paddle.Checkout.open({
      items: [{ priceId }],
      customer: {
        email: user.email,
      },
      customData: {
        userId: user.id,
      },
    });
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
