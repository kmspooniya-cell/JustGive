import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { allowRequest } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-ip";

export async function POST(request: Request) {
  if (!(await allowRequest(`admin-login:${getRequestIp(request)}`, 5))) return NextResponse.json({ error: "Too many sign-in attempts." }, { status: 429 });
  const parsed = z.object({ email: z.string().email(), password: z.string().min(8) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter valid sign-in details." }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return NextResponse.json({ error: "Sign-in failed." }, { status: 401 });
  return NextResponse.json({ ok: true });
}
