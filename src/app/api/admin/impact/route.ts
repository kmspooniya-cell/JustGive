import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  locale: z.enum(["en", "hi"]),
  title: z.string().trim().min(1).max(120),
  body: z.string().trim().min(1).max(600),
  happenedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  published: z.boolean().default(false),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the title, note, and date." }, { status: 400 });
  const db = await createSupabaseServerClient();
  if (!db) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { data: admin } = await db.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const { error } = await db.from("impact_entries").insert({
    locale: parsed.data.locale,
    title: parsed.data.title,
    body: parsed.data.body,
    happened_on: parsed.data.happenedOn,
    published: parsed.data.published,
    updated_by: user.id,
  });
  if (error) return NextResponse.json({ error: "Could not save the entry." }, { status: 503 });
  return NextResponse.json({ ok: true }, { status: 201 });
}