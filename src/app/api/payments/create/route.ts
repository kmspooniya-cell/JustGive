import { NextResponse } from "next/server";
import { amountSchema } from "@/lib/validation";
import { getPaymentProvider } from "@/lib/payments/provider";
import { registerDemoOrder } from "@/lib/payments/demo-store";
import { allowRequest } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-ip";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Payments are unavailable. No real payments can be accepted." }, { status: 503 });
  if (!(await allowRequest(`payment-order:${getRequestIp(request)}`, 8))) return NextResponse.json({ error: "Too many attempts. Please wait and try again." }, { status: 429 });
  try {
    const body = await request.json() as { amountPaise?: unknown };
    const amount = amountSchema.safeParse(body.amountPaise);
    if (!amount.success) return NextResponse.json({ error: "Enter a valid amount between ₹1 and ₹1,00,000." }, { status: 400 });
    const provider = getPaymentProvider();
    if (!provider) return NextResponse.json({ error: "Payment provider is not configured." }, { status: 503 });
    const internalOrderId = `jg_${crypto.randomUUID()}`;
    const order = await provider.createOrder({ internalOrderId, amountPaise: amount.data, currency: "INR" });
    registerDemoOrder(internalOrderId, amount.data);
    return NextResponse.json({ orderId: internalOrderId, checkoutUrl: order.checkoutUrl, simulated: true });
  } catch {
    return NextResponse.json({ error: "Unable to create a demo order." }, { status: 400 });
  }
}
