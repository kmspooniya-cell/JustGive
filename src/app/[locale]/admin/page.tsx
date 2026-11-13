import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminFinancialFilters } from "@/components/admin-financial-controls";
import { getMessages, isLocale } from "@/lib/i18n";
import { adminFinancialSummarySchema, formatCount, formatPaise, hasPartialFinancialData, type AdminFinancialSummary } from "@/lib/admin-financial-report";
import { resolveAdminDateRange, type AdminDateFilters } from "@/lib/date-range";
import { SiteHeader } from "@/components/site-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AdminProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<AdminDateFilters>;
};

export default async function Admin({ params, searchParams }: AdminProps) {
  const { locale: rawLocale } = await params;
  const filters = await searchParams;
  if (!isLocale(rawLocale)) notFound();

  const locale = rawLocale;
  const t = getMessages(locale);
  const copy = t.adminFinancial;
  const range = resolveAdminDateRange(filters);
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return (
      <>
        <SiteHeader locale={locale} />
        <main className="admin-shell">
          <h1>{t.admin}</h1>
          <p className="status-banner">{t.noAdmin}</p>
          <Link className="button" href={`/${locale}/admin/login`}>{t.login}</Link>
        </main>
      </>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/admin/login`);
  const { data: role, error: roleError } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (roleError) {
    return (
      <>
        <SiteHeader locale={locale} />
        <main className="admin-shell"><h1>{copy.overview}</h1><p className="form-error" role="alert">{copy.queryError}</p></main>
      </>
    );
  }
  if (!role) {
    return (
      <>
        <SiteHeader locale={locale} />
        <main className="admin-shell">
          <h1>{t.admin}</h1>
          <p role="alert">{locale === "hi" ? "इस खाते को प्रशासनिक अनुमति नहीं है।" : "This signed-in account is not an administrator."}</p>
        </main>
      </>
    );
  }

  let summary: AdminFinancialSummary | null = null;
  let queryFailed = false;
  if (!range.error) {
    try {
      const { data, error } = await supabase.rpc("admin_financial_summary", {
        p_from: range.startAt,
        p_to_exclusive: range.endBefore,
      });
      const parsed = adminFinancialSummarySchema.safeParse(Array.isArray(data) ? data[0] : null);
      if (error || !parsed.success) queryFailed = true;
      else summary = parsed.data;
    } catch {
      queryFailed = true;
    }
  }

  const basePath = `/${locale}/admin`;
  const exportHref = "/api/admin/export";
  const empty = summary
    ? BigInt(summary.payment_record_count) === 0n && BigInt(summary.successful_refund_count) === 0n
    : false;
  const cards = summary ? [
    [copy.records, formatCount(summary.payment_record_count)],
    [copy.gross, formatPaise(summary.gross_paise)],
    [copy.verifiedPayments, formatCount(summary.verified_payment_count)],
    [copy.average, formatPaise(summary.average_paise)],
    [copy.pending, formatCount(summary.pending_payment_count)],
    [copy.failed, formatCount(summary.failed_payment_count)],
    [copy.successfulRefunds, formatPaise(summary.refund_paise)],
    [copy.net, formatPaise(summary.net_contribution_paise)],
    [copy.fees, formatPaise(summary.settlement_fee_paise) ?? copy.notAvailable],
    [copy.settlements, formatPaise(summary.settlement_net_paise) ?? copy.notAvailable],
  ] : [];

  return (
    <>
      <SiteHeader locale={locale} />
      <main className="admin-shell">
        <span className="eyebrow">{locale === "hi" ? "निजी कार्यक्षेत्र" : "Private workspace"}</span>
        <h1>{copy.overview}</h1>
        <p className="page-note">{copy.paymentNote}</p>
        <p className="page-note">{copy.netDefinition}</p>
        <p className="page-note">{copy.dateNote}</p>
        <AdminFinancialFilters locale={locale} range={range} basePath={basePath} exportHref={exportHref} />
        {range.error && <p className="form-error" role="alert">{copy.invalidDate}</p>}
        <nav className="admin-nav" aria-label={locale === "hi" ? "प्रशासनिक अनुभाग" : "Admin sections"}>
          <Link href={basePath}>{copy.overview}</Link>
          <Link href={`/${locale}/admin/payments`}>{copy.payments}</Link>
          <Link href={`/${locale}/admin/refunds`}>{copy.refunds}</Link>
          <Link href={`/${locale}/admin/contact`}>{locale === "hi" ? "संपर्क" : "Contact"}</Link>
          <Link href={`/${locale}/admin/messages`}>{locale === "hi" ? "संदेश" : "Messages"}</Link>
          <Link href={`/${locale}/admin/moments`}>{locale === "hi" ? "दैनिक सामग्री" : "Daily content"}</Link>
          <Link href={`/${locale}/admin/reports`}>{locale === "hi" ? "रिपोर्ट" : "Reports"}</Link>
          <Link href={`/${locale}/admin/settings`}>{locale === "hi" ? "सेटिंग्स" : "Settings"}</Link>
          <Link href={`/${locale}/admin/activity`}>{locale === "hi" ? "गतिविधि" : "Activity"}</Link>
        </nav>
        {queryFailed && <p className="form-error" role="alert">{copy.queryError}</p>}
        {!range.error && !queryFailed && empty && <p className="status-banner" role="status">{copy.emptyOverview}</p>}
        {summary && hasPartialFinancialData(summary) && (
          <section className="page-note" aria-labelledby="financial-partial-title" role="status">
            <h2 id="financial-partial-title">{copy.partialTitle}</h2>
            {BigInt(summary.undated_successful_refund_count) > 0n && <p>{copy.undatedRefunds}</p>}
            {BigInt(summary.unverified_refunded_payment_count) > 0n && <p>{copy.unverifiedRefunds}</p>}
            {(BigInt(summary.incomplete_settlement_count) > 0n ||
              BigInt(summary.undated_settlement_count) > 0n ||
              BigInt(summary.unreconciled_payment_count) > 0n) && <p>{copy.incompleteSettlements}</p>}
          </section>
        )}
        {summary && !empty && (
          <>
            <div className="admin-grid">
              {cards.map(([label, value]) => (
                <article className="admin-card" key={label}>
                  <h2>{label}</h2>
                  <p>{value}</p>
                </article>
              ))}
            </div>
          </>
        )}
        <form action={`/api/admin/logout?locale=${locale}`} method="post">
          <button className="button-secondary" type="submit">{locale === "hi" ? "साइन आउट" : "Sign out"}</button>
        </form>
      </main>
    </>
  );
}
