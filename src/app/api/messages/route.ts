import { NextResponse } from "next/server";
import { messageSchema } from "@/lib/validation";
import { allowRequest } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-ip";
import { createSupabasePrivilegedClient } from "@/lib/supabase/privileged";

export async function POST(request: Request) {
  if (!(await allowRequest(`message:${getRequestIp(request)}`))) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  // Clone the request so we can inspect the body without consuming it for the fallback.
  const contentType = request.headers.get("content-type") ?? "";
  let payload: Record<string, unknown> | null = null;
  if (contentType.includes("application/json")) {
    payload = await request.json().catch(() => null);
  } else {
    const form = await request.formData().catch(() => null);
    if (form) {
      const rawMessage = form.get("message");
      const rawPassItOn = form.get("passItOn");
      payload = {
        message: typeof rawMessage === "string" ? rawMessage : undefined,
        publishConsent: form.get("publishConsent") === "true",
        passItOn: typeof rawPassItOn === "string" ? rawPassItOn : undefined,
        locale: typeof form.get("locale") === "string" ? form.get("locale") : undefined,
        website: typeof form.get("website") === "string" ? form.get("website") : undefined,
      };
    }
  }
  const parsed = messageSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: "Please check your message and consent." }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ ok: true });
  if (!parsed.data.message) return NextResponse.json({ error: "Please write a message." }, { status: 400 });
  const supabase = createSupabasePrivilegedClient();
  if (!supabase) return NextResponse.json({ error: "Message submissions are unavailable until server-side Supabase credentials are configured." }, { status: 503 });
  const passItOn = parsed.data.passItOn?.trim() ? parsed.data.passItOn.trim() : null;
  const { error } = await supabase.from("messages").insert({ body: parsed.data.message, public_consent: parsed.data.publishConsent, pass_it_on: passItOn, status: "pending", locale: parsed.data.locale === "hi-Latn" ? "hi" : parsed.data.locale });
  if (error) return NextResponse.json({ error: "Message could not be saved." }, { status: 503 });
  if (!contentType.includes("application/json")) return NextResponse.redirect(new URL(`/${parsed.data.locale}/wall-of-kindness?submitted=1`, request.url), 303);
  return NextResponse.json({ ok: true, moderation: "pending" }, { status: 202 });
}
