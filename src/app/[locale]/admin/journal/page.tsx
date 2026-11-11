import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { GratitudeJournal } from "@/components/gratitude-journal";

export default async function AdminJournal({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const db = await createSupabaseServerClient();
  if (!db) return <><SiteHeader locale={locale}/><main className="admin-shell"><h1>Gratitude Journal</h1><p>Configure Supabase to use private journal entries.</p></main></>;
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect(`/${locale}/admin/login`);
  const { data: admin } = await db.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) return <><SiteHeader locale={locale}/><main className="admin-shell"><h1>Access denied</h1></main></>;
  const hi = locale === "hi";
  return <><SiteHeader locale={locale}/><main className="admin-shell"><span className="eyebrow">{hi ? "निजी कार्यक्षेत्र" : "Private workspace"}</span><h1>{hi ? "कृतज्ञता जर्नल" : "Gratitude Journal"}</h1><p>{hi ? "निजी विचार लिखें। इन्हें केवल आपका साइन-इन किया हुआ व्यवस्थापक खाता पढ़ सकता है।" : "Keep personal reflections here. Only your signed-in admin account can read them."}</p><GratitudeJournal locale={locale}/></main></>;
}
