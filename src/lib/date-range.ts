const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export type AdminDateFilters = {
  from?: string | string[];
  to?: string | string[];
  period?: string | string[];
};

export type AdminDateQuery = {
  from?: string;
  to?: string;
  period?: string;
};

export type AdminDateRange = {
  from: string;
  to: string;
  period: string;
  startAt: string | null;
  endBefore: string | null;
  error?: "invalid" | "reversed";
};

function utcCalendarDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  if (year < 1000) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

function istStart(value: string) {
  const date = utcCalendarDate(value);
  return date ? new Date(date.getTime() - IST_OFFSET_MS).toISOString() : null;
}

function istEndExclusive(value: string) {
  const date = utcCalendarDate(value);
  return date ? new Date(date.getTime() + 24 * 60 * 60 * 1000 - IST_OFFSET_MS).toISOString() : null;
}

export function periodStart(period: string, now = new Date()) {
  if (period === "day") {
    const istNow = new Date(now.getTime() + IST_OFFSET_MS);
    const istMidnight = Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate());
    return new Date(istMidnight - IST_OFFSET_MS).toISOString();
  }
  const days = period === "week" ? 7 : period === "month" ? 30 : 0;
  return days ? new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString() : undefined;
}

export function resolveAdminDateRange(filters: AdminDateFilters, now = new Date()): AdminDateRange {
  const values = [filters.from, filters.to, filters.period];
  if (values.some((value) => Array.isArray(value) && value.length !== 1)) {
    return { from: "", to: "", period: "", startAt: null, endBefore: null, error: "invalid" };
  }
  const from = (Array.isArray(filters.from) ? filters.from[0] : filters.from)?.trim() ?? "";
  const to = (Array.isArray(filters.to) ? filters.to[0] : filters.to)?.trim() ?? "";
  const period = (Array.isArray(filters.period) ? filters.period[0] : filters.period)?.trim() ?? "";

  if (from || to) {
    const startAt = from ? istStart(from) : null;
    const endBefore = to ? istEndExclusive(to) : null;
    if ((from && !startAt) || (to && !endBefore)) return { from, to, period: "", startAt: null, endBefore: null, error: "invalid" };
    if (from && to && startAt! >= endBefore!) return { from, to, period: "", startAt, endBefore, error: "reversed" };
    return { from, to, period: "", startAt, endBefore };
  }

  if (!period) return { from, to, period, startAt: null, endBefore: null };
  const startAt = periodStart(period, now);
  if (!startAt) return { from, to, period, startAt: null, endBefore: null, error: "invalid" };
  return { from, to, period, startAt, endBefore: now.toISOString() };
}

function rangeBounds(column: string, range: AdminDateRange) {
  return [
    ...(range.startAt ? [`${column}.gte.${range.startAt}`] : []),
    ...(range.endBefore ? [`${column}.lt.${range.endBefore}`] : []),
  ];
}

export function paymentDateFilter(range: AdminDateRange) {
  if (!range.startAt && !range.endBefore) return null;
  const paid = ["verified_paid_at.not.is.null", ...rangeBounds("verified_paid_at", range)];
  const unpaid = ["verified_paid_at.is.null", ...rangeBounds("created_at", range)];
  return `and(${paid.join(",")}),and(${unpaid.join(",")})`;
}

export function refundDateFilter(range: AdminDateRange) {
  if (!range.startAt && !range.endBefore) return null;
  const completed = ["status.eq.successful", "completed_at.not.is.null", ...rangeBounds("completed_at", range)];
  const operational = ["status.neq.successful", ...rangeBounds("created_at", range)];
  return `and(${completed.join(",")}),and(${operational.join(",")})`;
}

export function adminDateQuery(filters: AdminDateQuery, page?: number) {
  const query = new URLSearchParams();
  if (filters.from) query.set("from", filters.from);
  if (filters.to) query.set("to", filters.to);
  if (filters.period && !filters.from && !filters.to) query.set("period", filters.period);
  if (page && page > 1) query.set("page", String(page));
  return query.toString();
}

export function parsePage(input?: string | string[]) {
  const value = Array.isArray(input) ? (input.length === 1 ? input[0] : undefined) : input;
  if (!value || !/^[1-9]\d*$/.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) ? page : 1;
}
