import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getAuthHeaders } from "@/lib/queryClient";

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
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/paddle/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ planName }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        console.error("[Paddle] Failed to get checkout URL:", data);
        alert(data.error || "Failed to open checkout. Please try again.");
        return;
      }

      window.open(data.url, "_blank");
    } catch (err) {
      console.error("[Paddle] Checkout error:", err);
      alert("Failed to open checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const displayText = buttonText || `Upgrade to ${planName.charAt(0).toUpperCase() + planName.slice(1)}`;

  return (
    <Button
      onClick={handleCheckout}
      variant={variant}
      size={size}
      className={`w-full ${className}`}
      disabled={loading}
      data-testid={`button-paddle-${planName}`}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Opening checkout…
        </>
      ) : (
        displayText
      )}
    </Button>
  );
}
