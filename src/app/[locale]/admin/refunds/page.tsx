import { notFound, redirect } from "next/navigation";
import { AdminFinancialFilters, AdminFinancialPagination } from "@/components/admin-financial-controls";
import { SiteHeader } from "@/components/site-header";
import { getMessages, isLocale } from "@/lib/i18n";
import { parsePage, refundDateFilter, resolveAdminDateRange, type AdminDateFilters } from "@/lib/date-range";
import { formatPaise } from "@/lib/admin-financial-report";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const PAGE_SIZE = 50;

type AdminRefundsProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<AdminDateFilters & { page?: string | string[] }>;
};

export default async function AdminRefunds({ params, searchParams }: AdminRefundsProps) {
  const { locale: rawLocale } = await params;
  const filters = await searchParams;
  if (!isLocale(rawLocale)) notFound();

  const locale = rawLocale;
  const t = getMessages(locale);
  const copy = t.adminFinancial;
  const range = resolveAdminDateRange(filters);
  const basePath = `/${locale}/admin/refunds`;
  const pageSize = PAGE_SIZE;
  let page = parsePage(filters.page);
  let rows: Array<{
    id: string;
    amount_paise: number;
    status: string;
    reason: string;
    created_at: string;
    completed_at: string | null;
  }> = [];
  let totalCount = 0;
  let undatedSuccessfulCount = 0;
  let queryFailed = false;

  const db = await createSupabaseServerClient();
  if (!db) {
    return (
      <>
        <SiteHeader locale={locale} />
        <main className="admin-shell"><h1>{copy.refunds}</h1><p>{t.noAdmin}</p></main>
      </>
    );
  }

  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect(`/${locale}/admin/login`);
  const { data: admin, error: adminError } = await db.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (adminError) {
    return (
      <>
        <SiteHeader locale={locale} />
        <main className="admin-shell"><h1>{copy.refunds}</h1><p className="form-error" role="alert">{copy.queryError}</p></main>
      </>
    );
  }
  if (!admin) {
    return (
      <>
        <SiteHeader locale={locale} />
        <main className="admin-shell"><h1>{copy.refunds}</h1><p role="alert">{t.noAdmin}</p></main>
      </>
    );
  }

  const loadPage = (pageNumber: number) => {
    let query = db
      .from("refunds")
      .select("id,amount_paise,status,reason,created_at,completed_at,contribution:contributions!inner(is_demo,verified_paid_at)", { count: "exact" })
      .eq("contribution.is_demo", false)
      .not("contribution.verified_paid_at", "is", null);
    const eventFilter = refundDateFilter(range);
    if (eventFilter) query = query.or(eventFilter);
    const offset = (pageNumber - 1) * pageSize;
    return query.order("created_at", { ascending: false }).range(offset, offset + pageSize - 1);
  };

  if (!range.error) {
    try {
      const [quality, result] = await Promise.all([
        db.from("refunds")
          .select("id,contribution:contributions!inner(is_demo,verified_paid_at)", { count: "exact", head: true })
          .eq("status", "successful")
          .is("completed_at", null)
          .eq("contribution.is_demo", false)
          .not("contribution.verified_paid_at", "is", null),
        loadPage(page),
      ]);
      if (quality.error || result.error) queryFailed = true;
      else {
        undatedSuccessfulCount = quality.count ?? 0;
        totalCount = result.count ?? 0;
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
        if (totalCount > 0 && page > totalPages) {
          page = totalPages;
          const lastPage = await loadPage(page);
          if (lastPage.error) queryFailed = true;
          else rows = lastPage.data ?? [];
        } else {
          rows = result.data ?? [];
        }
      }
    } catch {
      queryFailed = true;
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const statusLabels: Record<string, string> = copy.statusLabels;
  return (
    <>
      <SiteHeader locale={locale} />
      <main className="admin-shell">
        <h1>{copy.refunds}</h1>
        <p className="page-note">{copy.refundNote}</p>
        <p className="page-note">{copy.dateNote}</p>
        <AdminFinancialFilters locale={locale} range={range} basePath={basePath} exportHref="/api/admin/export/refunds" exportLabel={copy.refundsExport} />
        {range.error && <p className="form-error" role="alert">{copy.invalidDate}</p>}
        {queryFailed && <p className="form-error" role="alert">{copy.queryError}</p>}
        {!range.error && !queryFailed && undatedSuccessfulCount > 0 && (
          <section className="page-note" role="status">
            <h2>{copy.partialTitle}</h2>
            <p>{copy.undatedRefunds}</p>
          </section>
        )}
        {!range.error && !queryFailed && rows.length === 0 && <p className="status-banner" role="status">{copy.emptyRefunds}</p>}
        {!range.error && !queryFailed && rows.length > 0 && (
          <>
            <div className="admin-grid">
              {rows.map((row) => {
                const status = statusLabels[row.status] ?? row.status;
                const eventDate = row.status === "successful" ? row.completed_at : row.created_at;
                const eventLabel = row.status === "successful" ? copy.completedAt : copy.createdAt;
                return (
                  <article className="admin-card" key={row.id}>
                    <h2>{formatPaise(String(row.amount_paise))} · {status}</h2>
                    <p>{copy.reason}: {row.reason}</p>
                    <p>{eventLabel}: {eventDate
                      ? new Date(eventDate).toLocaleString(locale === "hi" ? "hi-IN" : "en-IN", { timeZone: "Asia/Kolkata" })
                      : copy.notAvailable}</p>
                  </article>
                );
              })}
            </div>
            <AdminFinancialPagination locale={locale} range={range} basePath={basePath} page={page} totalPages={totalPages} />
          </>
        )}
      </main>
    </>
  );
}
