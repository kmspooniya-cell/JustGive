import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({ key: z.enum(["kindness_universe", "kindness_tree"]), enabled: z.boolean() });
export async function POST(request: Request) {
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Invalid setting." }, { status: 400 });
  const db = await createSupabaseServerClient();
  if (!db) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { data: admin } = await db.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const { error } = await db.from("site_settings").upsert({ key: input.data.key, value: { enabled: input.data.enabled }, is_public: true, updated_by: user.id }, { onConflict: "key" });
  if (error) return NextResponse.json({ error: "Setting could not be saved." }, { status: 503 });
  return NextResponse.json({ ok: true });
}
