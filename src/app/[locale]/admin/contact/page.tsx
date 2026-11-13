import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { inlineCopy } from "@/lib/inline-copy";

export default async function AdminContact({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const hi = locale !== "en";
  const db = await createSupabaseServerClient();
  if (!db) return <><SiteHeader locale={locale}/><main className="admin-shell"><h1>{inlineCopy(locale, "संपर्क संदेश", "Contact messages")}</h1><p>Supabase is not configured.</p></main></>;
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect(`/${locale}/admin/login`);
  const { data: admin } = await db.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) return <><SiteHeader locale={locale}/><main className="admin-shell"><h1>{inlineCopy(locale, "अनुमति नहीं है", "Access denied")}</h1></main></>;
  const { data: messages, error } = await db.from("contact_messages").select("id,name,email,body,status,created_at").order("created_at", { ascending: false }).limit(200);
  return <><SiteHeader locale={locale}/><main className="admin-shell"><span className="eyebrow">{inlineCopy(locale, "निजी कार्यक्षेत्र", "Private workspace")}</span><h1>{inlineCopy(locale, "संपर्क संदेश", "Contact messages")}</h1><p className="page-note">{inlineCopy(locale, "संदेश और ईमेल केवल अधिकृत व्यवस्थापकों को दिखते हैं।", "Messages and email addresses are visible only to authorized administrators.")}</p>{error && <p role="alert">{inlineCopy(locale, "संदेश लोड नहीं हो सके।", "Messages could not be loaded.")}</p>}{messages?.length ? messages.map((message) => <article className="admin-card" key={message.id}><span className="eyebrow">{message.status} · {new Date(message.created_at).toLocaleString(hi ? "hi-IN" : "en-IN")}</span><h2>{message.name}</h2><p><a href={`mailto:${encodeURIComponent(message.email)}`}>{message.email}</a></p><p className="contact-message-body">{message.body}</p>{message.status !== "closed" && <form action="/api/admin/contact" method="post" className="contact-admin-actions"><input type="hidden" name="id" value={message.id}/><input type="hidden" name="locale" value={locale}/><button className="button-secondary" name="status" value="read">{inlineCopy(locale, "पढ़ा हुआ चिह्नित करें", "Mark as read")}</button><button className="button-secondary" name="status" value="closed">{inlineCopy(locale, "बंद करें", "Close")}</button></form>}</article>) : !error && <p>{inlineCopy(locale, "कोई संपर्क संदेश नहीं है।", "No contact messages.")}</p>}</main></>;
}
