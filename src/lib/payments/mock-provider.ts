import type { PaymentProvider, PaymentState } from "./types";

/** Development simulation only. It must never be enabled in production. */
export class MockPaymentProvider implements PaymentProvider {
  async createOrder(input: { internalOrderId: string; amountPaise: number; currency: "INR" }) {
    return { orderId: `demo_${input.internalOrderId}`, amountPaise: input.amountPaise, currency: input.currency, checkoutUrl: `/en/checkout?order=${encodeURIComponent(input.internalOrderId)}`, simulated: true };
  }
  async verifyPayment(input: { orderId: string; paymentId: string; amountPaise: number; currency: string }) { return Boolean(input.orderId && input.paymentId && input.amountPaise > 0 && input.currency === "INR"); }
  async verifyWebhook(rawBody: string, signature: string | null) { void rawBody; void signature; return false; }
  async fetchPaymentStatus(): Promise<PaymentState> { return "pending"; }
  async initiateRefund() { return { refundId: `demo_refund_${crypto.randomUUID()}`, status: "pending" as const }; }
}
