"use client";
import type { Locale } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { inlineCopy } from "@/lib/inline-copy";

type Entry = { id: string; body: string; created_at: string; updated_at: string };
export function GratitudeJournal({ locale }: { locale: Locale }) {
  const hi = locale !== "en";
  const [entries, setEntries] = useState<Entry[]>([]);
  const [body, setBody] = useState("");
  const [editing, setEditing] = useState<{ id: string; body: string } | null>(null);
  const [status, setStatus] = useState(inlineCopy(locale, "निजी प्रविष्टियाँ लोड हो रही हैं…", "Loading private entries…"));
  async function load() {
    try {
      const response = await fetch("/api/admin/journal", { cache: "no-store" });
      if (!response.ok) throw new Error("load failed");
      const data = await response.json() as { entries: Entry[] };
      setEntries(data.entries); setStatus("");
    } catch { setStatus(inlineCopy(locale, "जर्नल लोड नहीं हुआ। सत्र समाप्त होने पर फिर से साइन इन करें।", "Could not load the journal. Sign in again if your session expired.")); }
  }
  useEffect(() => {
    let active = true;
    fetch("/api/admin/journal", { cache: "no-store" }).then(async response => {
      if (!response.ok) throw new Error("load");
      return await response.json() as { entries: Entry[] };
    }).then(data => { if (active) { setEntries(data.entries); setStatus(""); } }).catch(() => {
      if (active) setStatus(inlineCopy(locale, "जर्नल लोड नहीं हुआ। सत्र समाप्त होने पर फिर से साइन इन करें।", "Could not load the journal. Sign in again if your session expired."));
    });
    return () => { active = false; };
  }, [hi]);
  async function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus("");
    try {
      const response = await fetch("/api/admin/journal", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ body }) });
      if (!response.ok) throw new Error("save failed");
      setBody(""); await load(); setStatus(inlineCopy(locale, "निजी प्रविष्टि सहेजी गई।", "Private entry saved."));
    } catch { setStatus(inlineCopy(locale, "प्रविष्टि सहेजी नहीं जा सकी।", "Entry could not be saved.")); }
  }
  async function remove(id: string) {
    try {
      const response = await fetch("/api/admin/journal", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
      if (!response.ok) throw new Error("delete failed");
      await load(); setStatus(inlineCopy(locale, "प्रविष्टि हटाई गई।", "Entry deleted."));
    } catch { setStatus(inlineCopy(locale, "प्रविष्टि हटाई नहीं जा सकी।", "Entry could not be deleted.")); }
  }
  async function update(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    try {
      const response = await fetch("/api/admin/journal", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(editing) });
      if (!response.ok) throw new Error("update failed");
      setEditing(null); await load(); setStatus(inlineCopy(locale, "प्रविष्टि अपडेट की गई।", "Entry updated."));
    } catch { setStatus(inlineCopy(locale, "प्रविष्टि अपडेट नहीं हो सकी।", "Entry could not be updated.")); }
  }
  return <div className="journal-layout"><p className="page-note">{inlineCopy(locale, "प्रविष्टियाँ केवल आपके व्यवस्थापक खाते के लिए हैं। यहाँ पासवर्ड, भुगतान विवरण या योगदानकर्ताओं की जानकारी न रखें।", "Entries are private to your admin account. Do not store passwords, payment details, or information about contributors here.")}</p>
    <form className="journal-form" onSubmit={event => void add(event)}><label htmlFor="journal-entry">{inlineCopy(locale, "कृतज्ञता का एक पल", "A moment you feel grateful for")}</label><textarea id="journal-entry" value={body} onChange={event => setBody(event.target.value)} maxLength={3000} minLength={1} required rows={5}/><small>{body.length}/3000</small><button className="button" type="submit">{inlineCopy(locale, "निजी प्रविष्टि सहेजें", "Save private entry")}</button></form>
    <p role="status" aria-live="polite">{status}</p><div className="journal-entries">{entries.map(entry => <article className="admin-card" key={entry.id}><time dateTime={entry.updated_at}>{new Date(entry.updated_at).toLocaleString(hi ? "hi-IN" : "en-IN")}</time>{editing?.id === entry.id ? <form className="journal-form" onSubmit={event => void update(event)}><label htmlFor={`edit-${entry.id}`}>{inlineCopy(locale, "प्रविष्टि संपादित करें", "Edit entry")}</label><textarea id={`edit-${entry.id}`} value={editing.body} onChange={event => setEditing({ id: entry.id, body: event.target.value })} maxLength={3000} minLength={1} required rows={4}/><button type="submit" className="button">{inlineCopy(locale, "बदलाव सहेजें", "Save changes")}</button><button type="button" className="button-secondary" onClick={() => setEditing(null)}>{inlineCopy(locale, "रद्द करें", "Cancel")}</button></form> : <><p className="journal-entry-body">{entry.body}</p><div className="checkout-actions"><button type="button" className="button-secondary" onClick={() => setEditing({ id: entry.id, body: entry.body })}>{inlineCopy(locale, "संपादित करें", "Edit")}</button><button type="button" className="button-secondary" onClick={() => void remove(entry.id)}>{inlineCopy(locale, "प्रविष्टि हटाएँ", "Delete entry")}</button></div></>}</article>)}</div>
  </div>;
}
