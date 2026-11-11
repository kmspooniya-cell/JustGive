import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";
import { allowRequest } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-ip";
import { createSupabasePrivilegedClient } from "@/lib/supabase/privileged";

export async function POST(request: Request) {
  if (!(await allowRequest(`contact:${getRequestIp(request)}`))) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  const form = await request.formData().catch(() => null);
  const parsed = contactSchema.safeParse(form ? Object.fromEntries(form) : await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the form fields." }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ ok: true });
  const supabase = createSupabasePrivilegedClient();
  if (!supabase) return NextResponse.json({ error: "Contact submissions are unavailable until server-side Supabase credentials are configured." }, { status: 503 });
  const { error } = await supabase.from("contact_messages").insert({ name: parsed.data.name, email: parsed.data.email, body: parsed.data.message });
  if (error) return NextResponse.json({ error: "Message could not be sent." }, { status: 503 });
  if (form) return NextResponse.redirect(new URL(`/${parsed.data.locale ?? "en"}/contact?sent=1`, request.url), 303);
  return NextResponse.json({ ok: true }, { status: 202 });
}
