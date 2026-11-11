import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { messageRiskFlags } from "@/lib/moderation";

export default async function AdminMessages({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const db = await createSupabaseServerClient();
  if (!db) return <><SiteHeader locale={locale}/><main className="admin-shell"><h1>Message moderation</h1><p>Configure Supabase to review messages.</p></main></>;
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect(`/${locale}/admin/login`);
  const { data: admin } = await db.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) return <><SiteHeader locale={locale}/><main className="admin-shell"><h1>Access denied</h1></main></>;
  const { data: messages } = await db.from("messages").select("id,body,locale,status,public_consent,created_at,report_count").order("created_at", { ascending: false }).limit(100);
  return <><SiteHeader locale={locale}/><main className="admin-shell"><span className="eyebrow">Private workspace</span><h1>Message moderation</h1><p className="page-note">Text cues are advisory only. Five unique reports temporarily hide a published message; review it here before restoring.</p>
    {messages?.length ? messages.map(message => {
      const flags = messageRiskFlags(message.body);
      const action = (name: string, label: string, buttonClass: string) => <form action={`/api/admin/messages?locale=${locale}`} method="post" key={name}><input type="hidden" name="id" value={message.id}/><input type="hidden" name="action" value={name}/><button className={buttonClass}>{label}</button></form>;
      return <article className="admin-card" key={message.id}><p>{message.body}</p><p>Status: {message.status} · Consent: {message.public_consent ? "yes" : "no"} · Reports: {message.report_count} · {new Date(message.created_at).toLocaleString()}</p>
        {flags.length > 0 && <p className="moderation-cues">Review cues: {flags.map(flag => flag.replaceAll("-", " ")).join(" · ")}. Human review required.</p>}
        <div className="checkout-actions">{message.status === "pending" && <>{action("approve", "Approve", "button")}{action("reject", "Reject", "button-secondary")}</>}{message.status === "approved" && action("remove", "Remove from wall", "button-secondary")}{message.status === "removed" && message.public_consent && <>{message.report_count >= 5 ? action("restore", "Restore after review", "button") : action("approve", "Restore to wall", "button")}</>}</div>
      </article>;
    }) : <p>No messages to review.</p>}
  </main></>;
}
