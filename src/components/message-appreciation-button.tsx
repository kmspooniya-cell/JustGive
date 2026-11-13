"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/i18n";

export function MessageAppreciationButton({ id, count, locale }: { id: string; count: number; locale: Locale }) {
  const [appreciations, setAppreciations] = useState(count);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);
  const t = getMessages(locale);
  async function appreciate() {
    setError(false);
    try {
      const response = await fetch("/api/messages/appreciate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messageId: id }) });
      if (!response.ok) throw new Error("Request failed");
      const result = await response.json() as { count: number; duplicate?: boolean };
      setAppreciations(result.count);
      setDone(true);
    } catch { setError(true); }
  }
  return <span className="appreciation-control"><button className="button-secondary appreciation-button" type="button" disabled={done} onClick={appreciate} aria-label={`${done ? t.appreciated : t.appreciate}, ${appreciations}`}><Heart size={14} aria-hidden="true" />{done ? t.appreciated : t.appreciate}<span>{appreciations.toLocaleString(locale !== "en" ? "hi-IN" : "en-IN")}</span></button>{error && <span className="sr-only" role="status">{locale !== "en" ? "अभी सराहना दर्ज नहीं हो सकी।" : "Appreciation could not be saved yet."}</span>}</span>;
}
