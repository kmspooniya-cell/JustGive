"use client";

import { useMemo, useState } from "react";
import { Check, Download, Link2, Share2 } from "lucide-react";
import { getMessages, type Locale } from "@/lib/i18n";
import { inlineCopy } from "@/lib/inline-copy";

function amountBand(paise: number, locale: Locale) {
  const rupees = Math.floor(paise / 100);
  if (rupees < 10) return inlineCopy(locale, "एक छोटा सा कदम", "A small step");
  if (rupees < 50) return inlineCopy(locale, "एक मीठी चिंगारी", "A little spark");
  if (rupees < 150) return inlineCopy(locale, "एक गर्मजोशी भरा इशारा", "A warm gesture");
  if (rupees < 500) return inlineCopy(locale, "एक खुला दिल", "An open heart");
  return inlineCopy(locale, "एक बड़ा सुकून", "A generous calm");
}

function formatDate(iso: string, hi: boolean) {
  return new Date(iso).toLocaleDateString(hi ? "hi-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[char] as string));
}

export function ReceiptCard({ amountPaise, causePreference, locale, shareUrl }: { amountPaise: number; causePreference: string | null; locale: Locale; shareUrl: string }) {
  const t = getMessages(locale);
  const hi = locale !== "en";
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const absoluteShareUrl = useMemo(() => {
    if (typeof window === "undefined") return shareUrl;
    return `${window.location.origin}${shareUrl}`;
  }, [shareUrl]);

  const band = amountBand(amountPaise, locale);
  const cause = causePreference ? t.causes[causePreference as keyof typeof t.causes] : null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(absoluteShareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  function downloadCard() {
    const svg = buildSvg(amountPaise, band, cause, locale);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `justgive-receipt-${amountPaise / 100}.svg`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 2200);
  }

  return (
    <div className="receipt-wrap">
      <figure className="receipt-card" aria-label={t.receiptCardAlt}>
        <div className="receipt-card-top">
          <span className="receipt-brand">JustGive</span>
          <span className="receipt-sim-tag">{inlineCopy(locale, "सिम्युलेटेड", "SIMULATED")}</span>
        </div>
        <div className="receipt-band">{band}</div>
        <div className="receipt-divider" aria-hidden="true" />
        <p className="receipt-amount">₹{(amountPaise / 100).toLocaleString(hi ? "hi-IN" : "en-IN")}</p>
        <p className="receipt-date">{formatDate(new Date().toISOString(), hi)}</p>
        {cause && <p className="receipt-cause">{inlineCopy(locale, "आपकी पसंद", "Your preference")}: {cause}</p>}
        <p className="receipt-foot">{inlineCopy(locale, "स्वैच्छिक · व्यक्तिगत · बिना इनाम", "Voluntary · personal · no rewards")}</p>
      </figure>

      <div className="receipt-actions">
        <button type="button" className="button" onClick={downloadCard}>
          {downloaded ? <Check size={16} aria-hidden="true" /> : <Download size={16} aria-hidden="true" />}
          {downloaded ? t.receiptSaved : t.receiptDownload}
        </button>
        <button type="button" className="button-secondary" onClick={copyLink}>
          {copied ? <Check size={16} aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />}
          {copied ? t.receiptCopied : t.receiptCopy}
        </button>
        <a
          className="button-secondary"
          href={`https://wa.me/?text=${encodeURIComponent(`${t.receiptWhatsapp} ${absoluteShareUrl}`)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Share2 size={16} aria-hidden="true" />
          {t.receiptShare}
        </a>
      </div>
    </div>
  );
}

function buildSvg(amountPaise: number, band: string, cause: string | null, locale: Locale) {
  const hi = locale !== "en";
  const amount = (amountPaise / 100).toLocaleString(hi ? "hi-IN" : "en-IN");
  const causeLine = cause ? `<text x="60" y="318" font-family="Inter, sans-serif" font-size="16" fill="#53676A">${escapeXml(cause)}</text>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="420" viewBox="0 0 720 420">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFF5E8"/><stop offset="0.55" stop-color="#E7F8F1"/><stop offset="1" stop-color="#FFE1D8"/></linearGradient></defs>
  <rect width="720" height="420" rx="34" fill="url(#bg)"/>
  <rect x="40" y="40" width="640" height="340" rx="24" fill="#FFFFFF" fill-opacity="0.82" stroke="#FFFFFF"/>
  <text x="60" y="92" font-family="Inter, sans-serif" font-weight="800" font-size="25" fill="#173C42">JustGive</text>
  <rect x="520" y="70" width="140" height="34" rx="17" fill="#FFF0EB" stroke="#F1C4B7"/>
  <text x="590" y="92" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" fill="#B84F49">${inlineCopy(locale, "सिम्युलेटेड", "SIMULATED")}</text>
  <text x="60" y="168" font-family="Georgia, serif" font-size="34" fill="#087F8C">${escapeXml(band)}</text>
  <line x1="60" y1="196" x2="660" y2="196" stroke="#CFE7DF" stroke-dasharray="4 6"/>
  <text x="60" y="268" font-family="Inter, sans-serif" font-weight="800" font-size="54" fill="#173C42">₹${escapeXml(amount)}</text>
  ${causeLine}
  <text x="60" y="356" font-family="Inter, sans-serif" font-size="13" fill="#718487">${inlineCopy(locale, "स्वैच्छिक · व्यक्तिगत · बिना इनाम", "Voluntary · personal · no rewards")}</text>
</svg>`;
}