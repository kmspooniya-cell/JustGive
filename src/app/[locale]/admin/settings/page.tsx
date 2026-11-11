import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { isLocale } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { AdminSettingsForm } from "@/components/admin-settings-form";

export default async function AdminSettings({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const db = await createSupabaseServerClient();
  if (!db) return <><SiteHeader locale={locale}/><main className="admin-shell"><h1>Settings</h1><p>Configure Supabase to manage site settings.</p></main></>;
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect(`/${locale}/admin/login`);
  const { data: admin } = await db.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) return <><SiteHeader locale={locale}/><main className="admin-shell"><h1>Access denied</h1></main></>;
  const { data: settings } = await db.from("site_settings").select("key,value").in("key", ["kindness_universe", "kindness_tree"]);
  const values = new Map((settings ?? []).map(setting => [setting.key, setting.value as { enabled?: boolean }]));
  return <><SiteHeader locale={locale}/><main className="admin-shell"><span className="eyebrow">Private workspace</span><h1>Site settings</h1>
    <p className="page-note">Only the two public visual switches are editable here. Payment settings cannot be changed in this interface; real payments require provider approval and a reviewed integration.</p>
    <AdminSettingsForm universe={values.get("kindness_universe")?.enabled !== false} tree={values.get("kindness_tree")?.enabled !== false}/>
    <h2>Private Gratitude Journal</h2><p>Personal notes are visible only to the signed-in admin who created them.</p><Link className="button-secondary" href={`/${locale}/admin/journal`}>Open journal</Link>
  </main></>;
}
