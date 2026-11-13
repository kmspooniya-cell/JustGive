import { NextResponse } from "next/server";
import { paymentDateFilter, resolveAdminDateRange } from "@/lib/date-range";
import { csvCell } from "@/lib/admin-financial-report";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const PAGE_SIZE = 1000;
const COLUMNS = [
  "internal_order_id",
  "provider",
  "provider_order_id",
  "provider_payment_id",
  "amount_paise",
  "currency",
  "status",
  "refund_status",
  "created_at",
  "verified_paid_at",
  "reconciliation_reference",
  "reconciled_at",
] as const;

export async function GET(request: Request) {
  const db = await createSupabaseServerClient();
  if (!db) return NextResponse.json({ error: "Admin database is unavailable." }, { status: 503 });

  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { data: admin, error: adminError } = await db
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (adminError) return NextResponse.json({ error: "Admin authorization could not be verified." }, { status: 503 });
  if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const search = new URL(request.url).searchParams;
  const value = (key: string) => {
    const values = search.getAll(key);
    return values.length > 1 ? values : values[0];
  };
  const range = resolveAdminDateRange({ from: value("from"), to: value("to"), period: value("period") });
  if (range.error) return NextResponse.json({ error: "Invalid date range." }, { status: 400 });

  const loadPage = (offset: number) => {
    let query = db
      .from("contributions")
      .select("internal_order_id,provider,provider_order_id,provider_payment_id,amount_paise,currency,status,refund_status,created_at,verified_paid_at,reconciliation_reference,reconciled_at")
      .eq("is_demo", false);
    const eventFilter = paymentDateFilter(range);
    if (eventFilter) query = query.or(eventFilter);
    return query
      .order("created_at", { ascending: false })
      .order("internal_order_id", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);
  };

  let rows: NonNullable<Awaited<ReturnType<typeof loadPage>>["data"]>;
  try {
    const result = await loadPage(0);
    if (result.error) return NextResponse.json({ error: "Export data could not be loaded." }, { status: 503 });
    let pageRows = result.data ?? [];
    rows = [...pageRows];
    for (let offset = PAGE_SIZE; pageRows.length === PAGE_SIZE; offset += PAGE_SIZE) {
      const next = await loadPage(offset);
      if (next.error) return NextResponse.json({ error: "Export data could not be loaded." }, { status: 503 });
      pageRows = next.data ?? [];
      rows.push(...pageRows);
    }
  } catch {
    return NextResponse.json({ error: "Export data could not be loaded." }, { status: 503 });
  }

  const body = [COLUMNS.join(","), ...rows.map((row) => COLUMNS.map((column) => csvCell(row[column])).join(","))].join("\r\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=justgive-financial-report.csv",
      "Cache-Control": "private, no-store",
    },
  });
}
