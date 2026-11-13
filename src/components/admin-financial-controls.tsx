import Link from "next/link";
import { getMessages, type Locale } from "@/lib/i18n";
import { adminDateQuery, type AdminDateQuery, type AdminDateRange } from "@/lib/date-range";

type AdminFinancialFiltersProps = {
  locale: Locale;
  range: AdminDateRange;
  basePath: string;
  exportHref?: string;
  exportLabel?: string;
};

function href(path: string, range: AdminDateQuery, page?: number) {
  const query = adminDateQuery(range, page);
  return query ? `${path}?${query}` : path;
}

export function AdminFinancialFilters({ locale, range, basePath, exportHref, exportLabel }: AdminFinancialFiltersProps) {
  const t = getMessages(locale).adminFinancial;
  return (
    <>
      <nav className="period-links" aria-label={t.dateRanges}>
        <Link href={href(basePath, { period: "day" })}>{t.day}</Link>
        <Link href={href(basePath, { period: "week" })}>{t.week}</Link>
        <Link href={href(basePath, { period: "month" })}>{t.month}</Link>
        {exportHref && !range.error && <Link href={href(exportHref, range)}>{exportLabel ?? t.export}</Link>}
      </nav>
      <p className="period-note">{t.timezone}</p>
      <form className="date-filter" action={basePath} method="get">
        <label>
          {t.from}
          <input type="date" name="from" defaultValue={range.from} />
        </label>
        <label>
          {t.to}
          <input type="date" name="to" defaultValue={range.to} />
        </label>
        <button className="button-secondary" type="submit">{t.apply}</button>
        <Link className="button-secondary" href={basePath}>{t.clear}</Link>
      </form>
    </>
  );
}

type AdminFinancialPaginationProps = {
  locale: Locale;
  range: AdminDateRange;
  basePath: string;
  page: number;
  totalPages: number;
};

export function AdminFinancialPagination({ locale, range, basePath, page, totalPages }: AdminFinancialPaginationProps) {
  const t = getMessages(locale).adminFinancial;
  if (totalPages <= 1) return null;
  return (
    <nav className="period-links" aria-label={t.pagination}>
      {page > 1 && <Link href={href(basePath, range, page - 1)}>{t.previous}</Link>}
      <span>{t.pageOf.replace("{page}", String(page)).replace("{total}", String(totalPages))}</span>
      {page < totalPages && <Link href={href(basePath, range, page + 1)}>{t.next}</Link>}
    </nav>
  );
}
