import { getMessages, isLocale, type Locale } from "@/lib/i18n";
import { readDemoReceipt } from "@/lib/payments/demo-store";
import { ReceiptCard } from "@/components/receipt-card";
import { SiteHeader } from "@/components/site-header";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { inlineCopy } from "@/lib/inline-copy";

type Receipt = { amountPaise: number; causePreference: string | null; receiptToken: string };

async function loadReceipt(locale: string, order: string | undefined, token: string | undefined): Promise<Receipt | null> {
  if (!order || !token) return null;
  if (process.env.NODE_ENV === "production") return null;
  const receipt = readDemoReceipt(order);
  if (!receipt || receipt.receiptToken !== token) return null;
  return receipt;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale !== "en" ? "आपकी पावती — JustGive" : "Your receipt — JustGive",
    robots: { index: false, follow: false },
  };
}

export default async function ReceiptPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ order?: string; token?: string }> }) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  const receipt = await loadReceipt(locale, query.order, query.token);
  const t = getMessages(locale as Locale);

  if (!receipt) {
    return (
      <>
        <SiteHeader locale={locale} />
        <main className="page-main receipt-page">
          <h1>{inlineCopy(locale, "पावती उपलब्ध नहीं", "Receipt unavailable")}</h1>
          <p className="lead">{inlineCopy(locale, "यह पावती केवल सिमुलेशन के बाद, सही लिंक से उपलब्ध होती है।", "This receipt is available only right after a simulation, from the exact link.")}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader locale={locale} />
      <main className="page-main receipt-page">
        <span className="eyebrow"><span className="demo-dot" aria-hidden="true" />{t.demo}</span>
        <h1>{t.receiptTitle}</h1>
        <p className="lead">{t.receiptLead}</p>
        <ReceiptCard
          amountPaise={receipt.amountPaise}
          causePreference={receipt.causePreference}
          locale={locale}
          shareUrl={`/${locale}/receipt?order=${encodeURIComponent(query.order ?? "")}&token=${encodeURIComponent(receipt.receiptToken)}`}
        />
        <p className="tiny-note">{t.receiptDisclosure}</p>
      </main>
    </>
  );
}