import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, CircleAlert, Clock3, Heart, Receipt } from "lucide-react";
import { getMessages, isLocale } from "@/lib/i18n";
import { SiteHeader } from "@/components/site-header";

type DemoState = "successful" | "pending" | "cancelled" | "failed";

export default async function Status({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ state?: string; simulated?: string; order?: string; token?: string }>;
}) {
  const { locale } = await params;
  const { state, simulated, order, token } = await searchParams;
  if (!isLocale(locale)) notFound();

  const t = getMessages(locale);
  const demoState = (simulated === "1" && ["successful", "pending", "cancelled", "failed"].includes(state ?? "")
    ? state
    : "failed") as DemoState;
  const isSuccess = demoState === "successful";
  const isPending = demoState === "pending";
  const title = isSuccess ? t.success : isPending ? t.pending : demoState === "cancelled" ? t.paymentCancelled : t.failed;
  const statusIcon = isSuccess ? <Check size={43} strokeWidth={1.8} aria-hidden="true" /> : isPending ? <Clock3 size={41} strokeWidth={1.7} aria-hidden="true" /> : <CircleAlert size={41} strokeWidth={1.7} aria-hidden="true" />;
  const explanation = locale !== "en"
    ? "यह केवल भुगतान का सिमुलेशन है। इससे वास्तविक भुगतान या धन प्राप्त होने की पुष्टि नहीं होती।"
    : "This is a payment simulation only. It does not confirm a real payment or money received.";

  return (
    <>
      <SiteHeader locale={locale} />
      <main className="payment-result" aria-live="polite">
        <div className={`payment-result-art ${isSuccess ? "success" : isPending ? "pending" : "failed"}`}>
          {statusIcon}
          {isSuccess && <Heart className="payment-result-heart" size={16} fill="currentColor" aria-hidden="true" />}
        </div>
        <p className="payment-result-label">{locale !== "en" ? "डेमो स्थिति" : "DEMO RESULT"}</p>
        <h1>{title}</h1>
        {isSuccess && <p className="payment-thank-you">{t.paymentThankYou}</p>}
        <p className="lead">{explanation}</p>
        <div className="status-banner">{t.demo}</div>
        {isSuccess && order && token && (
          <Link className="button-secondary payment-receipt-link" href={`/${locale}/receipt?order=${encodeURIComponent(order)}&token=${encodeURIComponent(token)}`}>
            <Receipt size={16} aria-hidden="true" />
            {locale !== "en" ? "अपनी पावती देखें" : "View your receipt"}
          </Link>
        )}
        <Link className="button payment-result-home" href={`/${locale}`}>{locale !== "en" ? "मुखपृष्ठ पर लौटें" : "Return home"}</Link>
      </main>
    </>
  );
}
