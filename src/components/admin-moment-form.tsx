"use client";
import type { Locale } from "@/lib/i18n";

import { useState, type FormEvent } from "react";
import { inlineCopy } from "@/lib/inline-copy";

export function AdminMomentForm({ locale }: { locale: Locale }) {
  const [status, setStatus] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const publishAt = form.get("publishAt");
    const response = await fetch("/api/admin/moments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locale: form.get("locale"), title: form.get("title"), body: form.get("body"), publishAt: publishAt ? new Date(String(publishAt)).toISOString() : undefined, published: form.get("published") === "on" }) });
    setStatus(response.ok ? (inlineCopy(locale, "सहेज लिया गया।", "Moment saved.")) : (inlineCopy(locale, "सहेज नहीं सके। जानकारी जाँचें।", "Could not save. Check the fields and try again.")));
    if (response.ok) formElement.reset();
  }
  return <form className="admin-moment-form" onSubmit={submit}>
    <label>{inlineCopy(locale, "भाषा", "Language")}<select name="locale" defaultValue={locale}><option value="en">English</option><option value="hi">हिन्दी</option></select></label>
    <label>{inlineCopy(locale, "शीर्षक", "Title")}<input name="title" maxLength={120} required /></label>
    <label>{inlineCopy(locale, "दैनिक संदेश", "Daily message")}<textarea name="body" maxLength={500} rows={4} required /></label>
    <label>{inlineCopy(locale, "प्रकाशन समय (वैकल्पिक)", "Publish time (optional)")}<input name="publishAt" type="datetime-local" /></label>
    <label className="checkbox-label"><input name="published" type="checkbox" />{inlineCopy(locale, "प्रकाशित करें", "Publish when scheduled")}</label>
    <button className="button" type="submit">{inlineCopy(locale, "सहेजें", "Save moment")}</button>
    {status && <p role="status">{status}</p>}
  </form>;
}
