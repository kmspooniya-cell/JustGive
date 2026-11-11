export type PaymentState = "created" | "pending" | "successful" | "failed" | "cancelled" | "refunded" | "partially_refunded";
export interface PaymentOrder { orderId: string; amountPaise: number; currency: "INR"; checkoutUrl: string; simulated: boolean }
export interface PaymentProvider {
  createOrder(input: { internalOrderId: string; amountPaise: number; currency: "INR" }): Promise<PaymentOrder>;
  verifyPayment(input: { orderId: string; paymentId: string; amountPaise: number; currency: string; signature?: string }): Promise<boolean>;
  verifyWebhook(rawBody: string, signature: string | null): Promise<boolean>;
  fetchPaymentStatus(orderId: string): Promise<PaymentState>;
  initiateRefund(input: { paymentId: string; amountPaise: number; reason: string }): Promise<{ refundId: string; status: "pending" | "successful" }>;
}
