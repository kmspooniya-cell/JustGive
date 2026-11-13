import { NextResponse } from "next/server";
import { refundDateFilter, resolveAdminDateRange } from "@/lib/date-range";
import { csvCell } from "@/lib/admin-financial-report";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const PAGE_SIZE = 1000;
const COLUMNS = [
  "refund_id",
  "internal_order_id",
  "amount_paise",
  "status",
  "reason",
  "created_at",
  "completed_at",
] as const;

type RefundRow = {
  id: string;
  amount_paise: number;
  status: string;
  reason: string;
  created_at: string;
  completed_at: string | null;
  contribution: { internal_order_id: string } | null;
};

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
      .from("refunds")
      .select("id,amount_paise,status,reason,created_at,completed_at,contribution:contributions!inner(internal_order_id,is_demo,verified_paid_at)")
      .eq("contribution.is_demo", false)
      .not("contribution.verified_paid_at", "is", null);
    const eventFilter = refundDateFilter(range);
    if (eventFilter) query = query.or(eventFilter);
    return query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);
  };

  let rows: RefundRow[];
  try {
    const result = await loadPage(0);
    if (result.error) return NextResponse.json({ error: "Export data could not be loaded." }, { status: 503 });
    let pageRows = (result.data ?? []) as unknown as RefundRow[];
    rows = [...pageRows];
    for (let offset = PAGE_SIZE; pageRows.length === PAGE_SIZE; offset += PAGE_SIZE) {
      const next = await loadPage(offset);
      if (next.error) return NextResponse.json({ error: "Export data could not be loaded." }, { status: 503 });
      pageRows = (next.data ?? []) as unknown as RefundRow[];
      rows.push(...pageRows);
    }
  } catch {
    return NextResponse.json({ error: "Export data could not be loaded." }, { status: 503 });
  }

  const body = [
    COLUMNS.join(","),
    ...rows.map((row) =>
      [
        row.id,
        row.contribution?.internal_order_id ?? "",
        row.amount_paise,
        row.status,
        row.reason,
        row.created_at,
        row.completed_at ?? "",
      ]
        .map((cell) => csvCell(cell))
        .join(","),
    ),
  ].join("\r\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=justgive-refund-report.csv",
      "Cache-Control": "private, no-store",
    },
  });
}