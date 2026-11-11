import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { allowRequest } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-ip";
import { createSupabasePrivilegedClient } from "@/lib/supabase/privileged";

export async function POST(request: Request) {
  if (!(await allowRequest(`report:${getRequestIp(request)}`, 3))) return NextResponse.json({ error: "Too many reports." }, { status: 429 });
  const parsed = z.object({ id: z.string().uuid(), reason: z.enum(["spam", "harassment", "personal_information", "other"]) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid report." }, { status: 400 });
  const db = createSupabasePrivilegedClient();
  if (!db) return NextResponse.json({ error: "Reporting is unavailable until server-side Supabase credentials are configured." }, { status: 503 });
  const secret = process.env.REACTION_HASH_SECRET;
  if (!secret || getRequestIp(request) === "unknown") return NextResponse.json({ error: "Reporting is temporarily unavailable." }, { status: 503 });
  const visitorHash = createHash("sha256").update(`${secret}:${getRequestIp(request)}:${request.headers.get("user-agent") ?? ""}`).digest("hex");
  const { data, error } = await db.rpc("report_public_message", { target_message_id: parsed.data.id, input_reporter_hash: visitorHash, input_reason: parsed.data.reason });
  if (error || !data) return NextResponse.json({ error: "Message could not be reported." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
