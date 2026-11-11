import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { allowRequest } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-ip";
import { createSupabasePrivilegedClient } from "@/lib/supabase/privileged";

export const runtime = "nodejs";
const schema = z.object({ messageId: z.string().uuid() });

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  if ((ip === "unknown" && process.env.NODE_ENV === "production") || !(await allowRequest(`appreciate:${ip}`, 20, 60 * 60_000))) return NextResponse.json({ error: "Appreciation is temporarily unavailable." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid message." }, { status: 400 });
  const secret = process.env.REACTION_HASH_SECRET;
  const db = createSupabasePrivilegedClient();
  if (!secret || !db) return NextResponse.json({ error: "Appreciation is not configured." }, { status: 503 });
  const userAgent = request.headers.get("user-agent") ?? "";
  const visitorHash = createHash("sha256").update(`${secret}:${ip}:${userAgent}`).digest("hex");
  const { data: message } = await db.from("messages").select("id,appreciation_count").eq("id", parsed.data.messageId).eq("status", "approved").eq("public_consent", true).maybeSingle();
  if (!message) return NextResponse.json({ error: "Message not found." }, { status: 404 });
  const { error } = await db.from("message_appreciations").insert({ message_id: message.id, visitor_hash: visitorHash });
  if (error?.code === "23505") return NextResponse.json({ count: message.appreciation_count, duplicate: true });
  if (error) return NextResponse.json({ error: "Could not save appreciation." }, { status: 503 });
  const { data: updated } = await db.from("messages").select("appreciation_count").eq("id", message.id).maybeSingle();
  return NextResponse.json({ count: updated?.appreciation_count ?? message.appreciation_count + 1 });
}
