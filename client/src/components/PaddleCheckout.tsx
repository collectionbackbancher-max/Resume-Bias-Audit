import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

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
  const [, navigate] = useLocation();

  const handleCheckout = () => {
    if (!user) return;
    const params = new URLSearchParams();
    if (user.email) params.set("email", user.email);
    if (user.uid) params.set("userId", user.uid);
    navigate(`/checkout/${planName}?${params.toString()}`);
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
