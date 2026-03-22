import crypto from "crypto";

interface PaddleWebhookBody {
  event_id: string;
  event_type: string;
  data: {
    id: string;
    subscription_id?: string;
    customer_id?: string;
    items?: Array<{ price_id: string }>;
    custom_data?: { userId?: string };
    status?: string;
  };
}

export function verifyPaddleWebhook(
  body: string,
  signature: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return hash === signature;
}

export function getPaddleHeaders() {
  return {
    Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
    "Content-Type": "application/json",
  };
}

export interface PaddleWebhookEvent {
  eventId: string;
  eventType: string;
  subscriptionId?: string;
  customerId?: string;
  priceId?: string;
  userId?: string;
  status?: string;
  transactionId?: string;
}

export function parsePaddleEvent(body: PaddleWebhookBody): PaddleWebhookEvent {
  const { event_id, event_type, data } = body;

  return {
    eventId: event_id,
    eventType: event_type,
    subscriptionId: data.subscription_id,
    customerId: data.customer_id,
    priceId: data.items?.[0]?.price_id,
    userId: data.custom_data?.userId,
    status: data.status,
    transactionId: data.id,
  };
}

export function getPlanFromPriceId(priceId: string): "starter" | "team" | null {
  if (priceId === process.env.PADDLE_PRICE_ID_STARTER) return "starter";
  if (priceId === process.env.PADDLE_PRICE_ID_TEAM) return "team";
  return null;
}
