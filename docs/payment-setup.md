# Payment setup and approval gate

The provider contract is in `src/lib/payments/types.ts`; `MockPaymentProvider` is development-only and production mode returns no enabled provider. No real payment integration is active. This is a personal voluntary-contribution model, not a store. Obtain written approval from the exact provider for this business model and account structure before implementing/configuring its hosted checkout.

Then implement the provider adapter with hosted order creation, raw-body webhook signature verification, authoritative status retrieval, exact amount/currency/order matching, unique event idempotency, atomic state transition, reconciliation, and refund APIs. Configure secrets only as server environment variables. Never trust a success redirect or use direct UPI/bank transfer as a workaround. Test provider sandbox separately before a reviewed, explicit production enablement.

In local development, `PAYMENT_MODE=mock` allows only clearly labeled simulated flow. In production, payment create endpoints return unavailable. Demo success is not financial data and is never included in statistics.
