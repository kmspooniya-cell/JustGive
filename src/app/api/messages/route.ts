import { NextResponse } from "next/server";
import { messageSchema } from "@/lib/validation";
import { allowRequest } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-ip";
import { createSupabasePrivilegedClient } from "@/lib/supabase/privileged";

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  if (!(await allowRequest(`message:${getRequestIp(request)}`))) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  const parsed = messageSchema.safeParse(form ? { message: form.get("message"), publishConsent: form.get("publishConsent") === "true", locale: form.get("locale"), website: form.get("website") } : await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check your message and consent." }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ ok: true });
  if (!parsed.data.message) return NextResponse.json({ error: "Please write a message." }, { status: 400 });
  const supabase = createSupabasePrivilegedClient();
  if (!supabase) return NextResponse.json({ error: "Message submissions are unavailable until server-side Supabase credentials are configured." }, { status: 503 });
  const { error } = await supabase.from("messages").insert({ body: parsed.data.message, public_consent: parsed.data.publishConsent, status: "pending", locale: parsed.data.locale });
  if (error) return NextResponse.json({ error: "Message could not be saved." }, { status: 503 });
  if (form) return NextResponse.redirect(new URL(`/${parsed.data.locale}/wall-of-kindness?submitted=1`, request.url), 303);
  return NextResponse.json({ ok: true, moderation: "pending" }, { status: 202 });
}
