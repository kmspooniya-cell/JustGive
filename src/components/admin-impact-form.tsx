"use client";
import { useState, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n";
import { inlineCopy } from "@/lib/inline-copy";

export function AdminImpactForm({ locale }: { locale: Locale }) {
  const [status, setStatus] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch("/api/admin/impact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locale: form.get("locale"),
        title: form.get("title"),
        body: form.get("body"),
        happenedOn: form.get("happenedOn"),
        published: form.get("published") === "on",
      }),
    });
    setStatus(response.ok ? (inlineCopy(locale, "एंट्री सहेज ली गई।", "Entry saved.")) : (inlineCopy(locale, "सहेज नहीं सके। जानकारी जाँचें।", "Could not save. Check the fields and try again.")));
    if (response.ok) formElement.reset();
  }
  return (
    <form className="admin-moment-form" onSubmit={submit}>
      <p className="page-note">{inlineCopy(locale, "व्यक्तिगत टिप्पणी दर्ज करें — चैरिटी आवंटन या धन का विवरण नहीं।", "Record a personal note — not a charitable allocation or fund statement.")}</p>
      <label>{inlineCopy(locale, "भाषा", "Language")}<select name="locale" defaultValue={locale === "hi-Latn" ? "hi" : locale}><option value="en">English</option><option value="hi">हिन्दी</option></select></label>
      <label>{inlineCopy(locale, "शीर्षक", "Title")}<input name="title" maxLength={120} required /></label>
      <label>{inlineCopy(locale, "टिप्पणी", "Note")}<textarea name="body" maxLength={600} rows={4} required /></label>
      <label>{inlineCopy(locale, "कब हुआ", "When it happened")}<input name="happenedOn" type="date" required /></label>
      <label className="checkbox-label"><input name="published" type="checkbox" />{inlineCopy(locale, "सार्वजनिक करें", "Publish")}</label>
      <button className="button" type="submit">{inlineCopy(locale, "एंट्री सहेजें", "Save entry")}</button>
      {status && <p role="status">{status}</p>}
    </form>
  );
}