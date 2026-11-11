import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({ id: z.string().uuid(), status: z.enum(["read", "closed"]), locale: z.enum(["en", "hi"]).default("en") });

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const parsed = schema.safeParse(form ? { id: form.get("id"), status: form.get("status"), locale: form.get("locale") } : await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid contact update." }, { status: 400 });
  const db = await createSupabaseServerClient();
  if (!db) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { data: admin } = await db.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const { error } = await db.from("contact_messages").update({ status: parsed.data.status }).eq("id", parsed.data.id).neq("status", "closed");
  if (error) return NextResponse.json({ error: "Contact status could not be updated." }, { status: 503 });
  if (form) return NextResponse.redirect(new URL(`/${parsed.data.locale}/admin/contact`, request.url), 303);
  return NextResponse.json({ ok: true });
}
