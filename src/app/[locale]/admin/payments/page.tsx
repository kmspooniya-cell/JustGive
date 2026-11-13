import { notFound, redirect } from "next/navigation";
import { AdminFinancialFilters, AdminFinancialPagination } from "@/components/admin-financial-controls";
import { SiteHeader } from "@/components/site-header";
import { getMessages, isLocale } from "@/lib/i18n";
import { parsePage, paymentDateFilter, resolveAdminDateRange, type AdminDateFilters } from "@/lib/date-range";
import { formatPaise } from "@/lib/admin-financial-report";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const PAGE_SIZE = 50;

type AdminPaymentsProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<AdminDateFilters & { page?: string | string[] }>;
};

export default async function AdminPayments({ params, searchParams }: AdminPaymentsProps) {
  const { locale: rawLocale } = await params;
  const filters = await searchParams;
  if (!isLocale(rawLocale)) notFound();

  const locale = rawLocale;
  const copy = getMessages(locale).adminFinancial;
  const range = resolveAdminDateRange(filters);
  const basePath = `/${locale}/admin/payments`;
  const pageSize = PAGE_SIZE;
  let page = parsePage(filters.page);
  let rows: Array<{
    internal_order_id: string;
    amount_paise: number;
    currency: string;
    status: string;
    created_at: string;
    verified_paid_at: string | null;
  }> = [];
  let totalCount = 0;
  let queryFailed = false;

  const db = await createSupabaseServerClient();
  if (!db) {
    return (
      <>
        <SiteHeader locale={locale} />
        <main className="admin-shell"><h1>{copy.payments}</h1><p>{getMessages(locale).noAdmin}</p></main>
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
        <main className="admin-shell"><h1>{copy.payments}</h1><p className="form-error" role="alert">{copy.queryError}</p></main>
      </>
    );
  }
  if (!admin) {
    return (
      <>
        <SiteHeader locale={locale} />
        <main className="admin-shell"><h1>{copy.payments}</h1><p role="alert">{getMessages(locale).noAdmin}</p></main>
      </>
    );
  }

  if (!range.error) {
    const loadPage = (pageNumber: number) => {
      let query = db
        .from("contributions")
        .select("internal_order_id,amount_paise,currency,status,created_at,verified_paid_at", { count: "exact" })
        .eq("is_demo", false);
      const eventFilter = paymentDateFilter(range);
      if (eventFilter) query = query.or(eventFilter);
      const offset = (pageNumber - 1) * pageSize;
      return query.order("created_at", { ascending: false }).range(offset, offset + pageSize - 1);
    };

    try {
      let result = await loadPage(page);
      if (result.error) queryFailed = true;
      else {
        totalCount = result.count ?? 0;
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
        if (totalCount > 0 && page > totalPages) {
          page = totalPages;
          result = await loadPage(page);
          if (result.error) queryFailed = true;
        }
        if (!queryFailed) rows = result.data ?? [];
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
        <h1>{copy.payments}</h1>
        <p className="page-note">{copy.paymentNote}</p>
        <p className="page-note">{copy.dateNote}</p>
        <AdminFinancialFilters locale={locale} range={range} basePath={basePath} exportHref="/api/admin/export" />
        {range.error && <p className="form-error" role="alert">{copy.invalidDate}</p>}
        {queryFailed && <p className="form-error" role="alert">{copy.queryError}</p>}
        {!range.error && !queryFailed && rows.length === 0 && <p className="status-banner" role="status">{copy.emptyPayments}</p>}
        {!range.error && !queryFailed && rows.length > 0 && (
          <>
            <div className="admin-grid">
              {rows.map((row) => {
                const paid = row.verified_paid_at !== null;
                const status = statusLabels[row.status] ?? row.status;
                const timestamp = row.verified_paid_at ?? row.created_at;
                const dateLabel = paid ? copy.verifiedAt : copy.createdAt;
                return (
                  <article className="admin-card" key={row.internal_order_id}>
                    <h2>{row.internal_order_id}</h2>
                    <p>{formatPaise(String(row.amount_paise))} · {status}</p>
                    <p>{dateLabel}: {new Date(timestamp).toLocaleString(locale === "hi" ? "hi-IN" : "en-IN", { timeZone: "Asia/Kolkata" })}</p>
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
