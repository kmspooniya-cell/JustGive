"use client";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";

type Reason = "spam" | "harassment" | "personal_information" | "other";
export function MessageReportButton({ id, locale, label }: { id: string; locale: Locale; label: string }) {
  const hi = locale === "hi";
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [reason, setReason] = useState<Reason>("other");
  const [error, setError] = useState(false);
  async function report(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(false);
    try {
      const response = await fetch("/api/messages/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, reason }) });
      if (!response.ok) throw new Error("Report failed");
      setDone(true); setOpen(false);
    } catch { setError(true); }
  }
  if (done) return <span className="report-done" role="status">{hi ? "रिपोर्ट किया" : "Reported"}</span>;
  return <div className="message-report-control"><button className="button-secondary" type="button" aria-expanded={open} onClick={() => setOpen(value => !value)}>{label}</button>{open && <form className="report-reason-form" onSubmit={event => void report(event)}>
    <label htmlFor={`report-reason-${id}`}>{hi ? "रिपोर्ट का कारण" : "Reason for report"}</label>
    <select id={`report-reason-${id}`} value={reason} onChange={event => setReason(event.target.value as Reason)}><option value="spam">{hi ? "स्पैम या भ्रामक सामग्री" : "Spam or misleading"}</option><option value="harassment">{hi ? "उत्पीड़न या अपमान" : "Harassment or abuse"}</option><option value="personal_information">{hi ? "निजी जानकारी" : "Personal information"}</option><option value="other">{hi ? "अन्य चिंता" : "Other concern"}</option></select>
    <button className="button-secondary" type="submit">{hi ? "रिपोर्ट भेजें" : "Send report"}</button>{error && <span role="status">{hi ? "रिपोर्ट अभी नहीं भेजी जा सकी।" : "Report could not be sent yet."}</span>}
  </form>}</div>;
}
