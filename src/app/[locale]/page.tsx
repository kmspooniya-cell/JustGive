import Link from "next/link";
import { ArrowDown, ArrowRight, CheckCircle2, Flower2, HandHeart, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { getMessages, isLocale } from "@/lib/i18n";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContributionForm } from "@/components/contribution-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AnimatedHeart } from "@/components/animated-heart";
import { GlassCard } from "@/components/glass-surfaces";
import { KindnessTree, KindnessVisuals } from "@/components/kindness-visuals";
import { MessageAppreciationButton } from "@/components/message-appreciation-button";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const hi = locale === "hi";
  return {
    title: hi ? "जस्टगिव — खुशी से दें। सुकून महसूस करें।" : "JustGive — Give Freely. Feel Good. Repeat.",
    description: hi ? "एक निजी स्वैच्छिक योगदान वेबसाइट।" : "A personal voluntary contribution website.",
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getMessages(locale);
  const hi = locale === "hi";
  const db = await createSupabaseServerClient();
  const { data: wallMessages } = db
    ? await db.from("approved_messages").select("id,body,locale,created_at,appreciation_count").order("created_at", { ascending: false }).limit(3)
    : { data: null };
  const { data: summary } = db ? await db.rpc("public_contribution_summary") : { data: null };
  const verifiedCount = Number(Array.isArray(summary) ? summary[0]?.successful_count ?? 0 : 0);
  const { data: visualSettings } = db ? await db.from("site_settings").select("key,value").in("key", ["kindness_universe", "kindness_tree"]) : { data: null };
  const visualFlags = new Map((visualSettings ?? []).map(setting => [setting.key, setting.value as { enabled?: boolean }]));
  const { data: dailyMoment } = db ? await db.from("daily_moments").select("title,body").eq("locale", locale).eq("published", true).lte("publish_at", new Date().toISOString()).order("publish_at", { ascending: false }).limit(1).maybeSingle() : { data: null };

  return (
    <>
      <SiteHeader locale={locale} />
      <main>
        <section className="hero-section" aria-labelledby="home-title">
          <div className="hero-copy">
            <h1 id="home-title">
              <span>{hi ? "थोड़ा सा देना।" : "A little giving."}</span>
              <em>{hi ? "थोड़ी सी खुशी।" : "A little happiness."}</em>
            </h1>
            <p>{t.heroText}</p>
            <div className="hero-actions">
              <a className="button hero-cta" href="#give">{t.nav.give}<ArrowRight size={18} aria-hidden="true" /></a>
              <Link className="hero-secondary-link" href={`/${locale}/how-it-works`}>{hi ? "यह कैसे काम करता है" : "How it works"}<ArrowDown size={15} aria-hidden="true" /></Link>
            </div>
            <div className="hero-assurance" aria-label={hi ? "योगदान की जानकारी" : "Contribution details"}>
              <span><ShieldCheck size={16} aria-hidden="true" />{hi ? "स्पष्ट और ईमानदार" : "Clear and transparent"}</span>
              <span><Heart size={16} aria-hidden="true" />{hi ? "पूरी तरह वैकल्पिक" : "Always optional"}</span>
            </div>
          </div>
          <AnimatedHeart locale={locale} />
        </section>

        <section className="give-section" aria-label={t.choose}>
          <div className="give-intro">
            <h2>{hi ? "देने का कोई सही तरीका नहीं।" : "There’s no one right way to give."}</h2>
            <p>{hi ? "अपनी इच्छा से चुनें। योगदान वेबसाइट के मालिक को व्यक्तिगत रूप से मिलता है।" : "Choose what feels right to you. Contributions go to the website owner personally."}</p>
            <Link className="text-link" href={`/${locale}/payment-disclosure`}>{hi ? "योगदान संबंधी जानकारी पढ़ें" : "Read the contribution disclosure"}<ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <ContributionForm locale={locale} />
        </section>

        <section className="content-section why-section" id="why">
          <div className="section-intro"><h2>{t.whyTitle}</h2><p>{t.whyText}</p></div>
          <div className="reason-cards">
            <GlassCard><div className="reason-icon coral"><HandHeart aria-hidden="true" /></div><h3>{hi ? "आपकी इच्छा से" : "By your choice"}</h3><p>{hi ? "यहाँ कुछ भी अनिवार्य नहीं है।" : "Nothing here is expected or required."}</p></GlassCard>
            <GlassCard><div className="reason-icon yellow"><Sparkles aria-hidden="true" /></div><h3>{hi ? "छोटी सी खुशी" : "A little happiness"}</h3><p>{hi ? "देने का आनंद ही इसकी वजह है।" : "The joy of giving is the whole point."}</p></GlassCard>
            <GlassCard><div className="reason-icon ocean"><ShieldCheck aria-hidden="true" /></div><h3>{hi ? "बात साफ़ है" : "Clear and honest"}</h3><p>{hi ? "योगदान मालिक को व्यक्तिगत रूप से मिलता है।" : "Contributions go to the owner personally."}</p></GlassCard>
          </div>
        </section>

        <section className="steps-section" id="how">
          <div><h2>{t.howTitle}</h2><p>{hi ? "सरल, स्पष्ट और हमेशा स्वैच्छिक।" : "Simple, transparent, and always voluntary."}</p><Link className="text-link" href={`/${locale}/how-it-works`}>{hi ? "पूरी प्रक्रिया जानें" : "See the full process"}<ArrowRight size={16} aria-hidden="true" /></Link></div>
          <ol>{t.steps.map((step, index) => <li key={step}><span aria-hidden="true">0{index + 1}</span>{step}<CheckCircle2 size={19} aria-hidden="true" /></li>)}</ol>
        </section>

        <section className="wall-preview">
          <div className="wall-copy"><h2>{t.wallTitle}</h2><p>{t.wallText}</p><Link className="text-link" href={`/${locale}/wall-of-kindness`}>{hi ? "दयालुता की दीवार देखें" : "Visit the Wall of Kindness"}<ArrowRight size={16} aria-hidden="true" /></Link></div>
          <div className="wall-preview-messages" aria-label={t.wallTitle}>
            {wallMessages?.length ? wallMessages.map((message) => <figure className="wall-message-card" key={message.id}><Flower2 size={21} aria-hidden="true" /><blockquote>{message.body}</blockquote><figcaption>{new Date(message.created_at).toLocaleDateString(hi ? "hi-IN" : "en-IN")}<MessageAppreciationButton id={message.id} count={message.appreciation_count} locale={locale}/></figcaption></figure>) : <div className="quote-card"><Flower2 size={27} className="wall-mark" aria-hidden="true" /><p>{t.emptyWall}</p><span className="quote-by">{hi ? "दयालुता की दीवार" : "The Wall of Kindness"}</span></div>}
          </div>
        </section>

        {visualFlags.get("kindness_universe")?.enabled !== false && <KindnessVisuals count={verifiedCount} locale={locale} />}
        {visualFlags.get("kindness_tree")?.enabled !== false && <KindnessTree count={verifiedCount} locale={locale} />}
        {dailyMoment && <section className="daily-moment glass-panel" aria-labelledby="daily-moment-title"><span className="eyebrow">{hi ? "आज का दयालुता पल" : "A daily kindness moment"}</span><h2 id="daily-moment-title">{dailyMoment.title}</h2><p>{dailyMoment.body}</p></section>}

        <section className="stats-section"><div className="stats-icon"><ShieldCheck size={25} aria-hidden="true" /></div><div><h2>{t.statsTitle}</h2><p>{t.emptyStats}</p></div><Link href={`/${locale}/transparency`} aria-label={t.nav.transparency}><ArrowRight aria-hidden="true" /></Link></section>

        <section className="faq-section"><h2>{t.faqTitle}</h2><div className="faq-grid">{t.faq.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
