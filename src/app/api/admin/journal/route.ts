import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const createSchema = z.object({ body: z.string().trim().min(1).max(3000) });
const updateSchema = z.object({ id: z.string().uuid(), body: z.string().trim().min(1).max(3000) });
const deleteSchema = z.object({ id: z.string().uuid() });
async function getAdminDb() {
  const db = await createSupabaseServerClient();
  if (!db) return { db: null, response: NextResponse.json({ error: "Supabase is not configured." }, { status: 503 }) };
  const { data: { user } } = await db.auth.getUser();
  if (!user) return { db: null, response: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  const { data: admin } = await db.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) return { db: null, response: NextResponse.json({ error: "Forbidden." }, { status: 403 }) };
  return { db, user, response: null };
}
export async function GET() {
  const auth = await getAdminDb();
  if (!auth.db) return auth.response!;
  const { data, error } = await auth.db.from("gratitude_journal").select("id,body,created_at,updated_at").order("created_at", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: "Journal could not be loaded." }, { status: 503 });
  return NextResponse.json({ entries: data ?? [] });
}
export async function POST(request: Request) {
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Entry must contain 1–3000 characters." }, { status: 400 });
  const auth = await getAdminDb();
  if (!auth.db) return auth.response!;
  const { data, error } = await auth.db.from("gratitude_journal").insert({ admin_user_id: auth.user!.id, body: parsed.data.body }).select("id,body,created_at,updated_at").single();
  if (error) return NextResponse.json({ error: "Entry could not be saved." }, { status: 503 });
  return NextResponse.json({ entry: data }, { status: 201 });
}
export async function PATCH(request: Request) {
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Entry must contain 1–3000 characters." }, { status: 400 });
  const auth = await getAdminDb();
  if (!auth.db) return auth.response!;
  const { error } = await auth.db.from("gratitude_journal").update({ body: parsed.data.body, updated_at: new Date().toISOString() }).eq("id", parsed.data.id).eq("admin_user_id", auth.user!.id);
  if (error) return NextResponse.json({ error: "Entry could not be updated." }, { status: 503 });
  return NextResponse.json({ ok: true });
}
export async function DELETE(request: Request) {
  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid entry." }, { status: 400 });
  const auth = await getAdminDb();
  if (!auth.db) return auth.response!;
  const { error } = await auth.db.from("gratitude_journal").delete().eq("id", parsed.data.id).eq("admin_user_id", auth.user!.id);
  if (error) return NextResponse.json({ error: "Entry could not be deleted." }, { status: 503 });
  return NextResponse.json({ ok: true });
}
