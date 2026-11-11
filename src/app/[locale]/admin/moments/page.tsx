import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { AdminMomentForm } from "@/components/admin-moment-form";

export default async function AdminMoments({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const hi = locale === "hi";
  const db = await createSupabaseServerClient();
  if (!db) return <><SiteHeader locale={locale}/><main className="admin-shell"><h1>{hi ? "दैनिक संदेश" : "Daily moments"}</h1><p>Supabase must be configured to manage content.</p></main></>;
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect(`/${locale}/admin/login`);
  const { data: admin } = await db.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) return <><SiteHeader locale={locale}/><main className="admin-shell"><h1>{hi ? "अनुमति नहीं है" : "Access denied"}</h1></main></>;
  const { data: moments } = await db.from("daily_moments").select("id,locale,title,body,publish_at,published").order("publish_at", { ascending: false }).limit(50);
  return <><SiteHeader locale={locale}/><main className="admin-shell"><span className="eyebrow">{hi ? "नियंत्रण कक्ष" : "Owner workspace"}</span><h1>{hi ? "दैनिक दयालुता संदेश" : "Daily kindness moments"}</h1><p className="page-note">{hi ? "प्रकाशित सामग्री भाषा और निर्धारित समय के अनुसार सार्वजनिक होगी।" : "Published content appears in its language after its scheduled time."}</p><AdminMomentForm locale={locale}/><h2>{hi ? "हाल के संदेश" : "Recent moments"}</h2>{moments?.length ? moments.map((moment) => <article className="admin-card" key={moment.id}><h3>{moment.title} · {moment.locale}</h3><p>{moment.body}</p><small>{moment.published ? (hi ? "प्रकाशित" : "Published") : (hi ? "मसौदा" : "Draft")} · {new Date(moment.publish_at).toLocaleString(hi ? "hi-IN" : "en-IN")}</small></article>) : <p>{hi ? "अभी कोई संदेश नहीं है।" : "No moments yet."}</p>}</main></>;
}
