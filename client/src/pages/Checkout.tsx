import { useEffect, useState } from "react";
import { useParams } from "wouter";

declare global {
  interface Window {
    Paddle?: any;
  }
}

export default function Checkout() {
  const params = useParams<{ plan: string }>();
  const plan = params.plan as "starter" | "team";
  const [status, setStatus] = useState<"loading" | "opening" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const priceId =
      plan === "starter"
        ? import.meta.env.VITE_PADDLE_PRICE_ID_STARTER
        : import.meta.env.VITE_PADDLE_PRICE_ID_TEAM;

    const email = new URLSearchParams(window.location.search).get("email") || "";
    const userId = new URLSearchParams(window.location.search).get("userId") || "";

    if (!priceId) {
      setStatus("error");
      setErrorMsg("Plan not found. Please go back and try again.");
      return;
    }

    // Load Paddle script
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => {
      if (!window.Paddle) {
        setStatus("error");
        setErrorMsg("Payment system failed to load. Please try again.");
        return;
      }
      window.Paddle.Setup({
        token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN,
        eventCallback: (event: any) => {
          if (event.name === "checkout.completed") {
            setStatus("loading");
            window.location.href = "/";
          }
          if (event.name === "checkout.closed") {
            window.close();
          }
        },
      });

      setStatus("opening");

      const checkoutOptions: any = {
        items: [{ priceId, quantity: 1 }],
        settings: {
          displayMode: "overlay",
          theme: "dark",
          locale: "en",
        },
      };

      if (email) {
        checkoutOptions.customer = { email };
      }
      if (userId) {
        checkoutOptions.customData = { userId };
      }

      window.Paddle.Checkout.open(checkoutOptions);
    };
    script.onerror = () => {
      setStatus("error");
      setErrorMsg("Failed to load payment system. Please check your connection.");
    };
    document.head.appendChild(script);
  }, [plan]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        color: "#fff",
      }}
    >
      {status === "loading" && (
        <>
          <div
            style={{
              width: 48,
              height: 48,
              border: "3px solid rgba(6,182,212,0.3)",
              borderTop: "3px solid #06b6d4",
              borderRadius: "50%",
              animation: "spin 0.9s linear infinite",
              marginBottom: 20,
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#94a3b8", fontSize: 15 }}>Loading payment…</p>
        </>
      )}
      {status === "opening" && (
        <p style={{ color: "#94a3b8", fontSize: 15 }}>
          Complete your purchase in the checkout window above.
        </p>
      )}
      {status === "error" && (
        <>
          <p style={{ color: "#f87171", fontSize: 16, marginBottom: 12 }}>{errorMsg}</p>
          <a
            href="/pricing"
            style={{
              color: "#06b6d4",
              textDecoration: "underline",
              fontSize: 14,
            }}
          >
            ← Back to Pricing
          </a>
        </>
      )}
    </div>
  );
}
