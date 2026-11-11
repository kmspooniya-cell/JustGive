import { MockPaymentProvider } from "./mock-provider";
import type { PaymentProvider } from "./types";

export function getPaymentProvider(): PaymentProvider | null {
  if (process.env.NODE_ENV !== "production" && (process.env.PAYMENT_MODE ?? "mock") === "mock") return new MockPaymentProvider();
  // No live adapter is enabled until provider-specific written approval is recorded and implemented.
  return null;
}
