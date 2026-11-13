"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getMessages, type Locale } from "@/lib/i18n";

export function CheckoutActions({ order, amount, locale }: { order: string; amount: number; locale: Locale }) {
  const t = getMessages(locale);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function pay(outcome: "success" | "pending" | "failed") {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/payments/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order, amountPaise: amount * 100, outcome }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      if (result.status === "successful" && result.simulated === true) {
        try {
          window.sessionStorage.setItem("justgive:contribution-confirmed", "1");
        } catch (storageError) {
          console.warn("Could not save the optional contribution celebration.", storageError);
        }
      }
      const receipt = result.receiptToken ? `&token=${encodeURIComponent(result.receiptToken)}` : "";
      router.push(`/${locale}/payment-status?state=${result.status}&simulated=1&order=${encodeURIComponent(order)}${receipt}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not complete demo.");
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="checkout-actions">
        <button className="button" disabled={busy || !order} onClick={() => pay("success")}>
          {busy ? (locale !== "en" ? "प्रक्रिया जारी…" : "Processing…") : t.simulate}
        </button>
        <button className="button-secondary" disabled={busy || !order} onClick={() => pay("pending")}>{t.simulatePending}</button>
        <button className="button-secondary" disabled={busy || !order} onClick={() => pay("failed")}>{t.simulateFailure}</button>
        <button className="button-secondary" onClick={() => router.push(`/${locale}/payment-status?state=cancelled&simulated=1`)}>{t.cancel}</button>
      </div>
      {error && <p role="alert" className="form-error">{error}</p>}
    </div>
  );
}
