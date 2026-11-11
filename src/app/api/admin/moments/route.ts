import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  locale: z.enum(["en", "hi"]),
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(500),
  publishAt: z.string().datetime().optional(),
  published: z.boolean().default(false),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the title, message, and publishing time." }, { status: 400 });
  const db = await createSupabaseServerClient();
  if (!db) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { data: admin } = await db.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const { error } = await db.from("daily_moments").insert({
    locale: parsed.data.locale,
    title: parsed.data.title,
    body: parsed.data.body,
    publish_at: parsed.data.publishAt ?? new Date().toISOString(),
    published: parsed.data.published,
    updated_by: user.id,
  });
  if (error) return NextResponse.json({ error: "Could not save the daily moment." }, { status: 503 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
