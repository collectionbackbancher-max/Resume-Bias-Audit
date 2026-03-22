import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

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

  const handleCheckout = () => {
    if (!user) return;

    const priceId =
      planName === "starter"
        ? import.meta.env.VITE_PADDLE_PRICE_ID_STARTER
        : import.meta.env.VITE_PADDLE_PRICE_ID_TEAM;

    if (!priceId) {
      console.error("[Paddle] Price ID not configured for plan:", planName);
      return;
    }

    // Build a direct Paddle-hosted checkout URL (no API key needed)
    const params = new URLSearchParams({
      "items[0][priceId]": priceId,
      "items[0][quantity]": "1",
    });

    if (user.email) {
      params.set("customer_email", user.email);
    }
    if (user.id) {
      params.set("custom_data[userId]", user.id);
    }

    const checkoutUrl = `https://buy.paddle.com/checkout?${params.toString()}`;
    window.open(checkoutUrl, "_blank", "noopener,noreferrer");
  };

  const displayText =
    buttonText ||
    `Upgrade to ${planName.charAt(0).toUpperCase() + planName.slice(1)}`;

  return (
    <Button
      onClick={handleCheckout}
      variant={variant}
      size={size}
      className={`w-full ${className}`}
      data-testid={`button-paddle-${planName}`}
    >
      {displayText}
    </Button>
  );
}
