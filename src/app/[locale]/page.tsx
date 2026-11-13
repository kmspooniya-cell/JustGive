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
import { KindnessVisuals } from "@/components/kindness-visuals";
import { MessageAppreciationButton } from "@/components/message-appreciation-button";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const deva = locale === "hi";
  return {
    title: deva ? "जस्टगिव — खुशी से दें। सुकून महसूस करें।" : locale === "hi-Latn" ? "JustGive — Khushi se dein. Sukoon mehsoos karein." : "JustGive — Give Freely. Feel Good. Repeat.",
    description: deva ? "एक निजी स्वैच्छिक योगदान वेबसाइट।" : locale === "hi-Latn" ? "Ek niji vaikalpik yogadaan vebsait." : "A personal voluntary contribution website.",
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", hi: "/hi", "x-default": "/en" },
    },
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getMessages(locale);
  const db = await createSupabaseServerClient();
  const { data: wallMessages } = db
    ? await db.from("approved_messages").select("id,body,locale,created_at,appreciation_count,pass_it_on").order("created_at", { ascending: false }).limit(3)
    : { data: null };
  const { data: summary } = db ? await db.rpc("public_contribution_summary") : { data: null };
  const verifiedCount = Number(Array.isArray(summary) ? summary[0]?.successful_count ?? 0 : 0);
  const { data: visualSettings } = db ? await db.from("site_settings").select("key,value").eq("key", "kindness_universe") : { data: null };
  const visualFlags = new Map((visualSettings ?? []).map(setting => [setting.key, setting.value as { enabled?: boolean }]));
  const { data: dailyMoment } = db ? await db.from("daily_moments").select("title,body").eq("locale", locale).eq("published", true).lte("publish_at", new Date().toISOString()).order("publish_at", { ascending: false }).limit(1).maybeSingle() : { data: null };

  return (
    <>
      <SiteHeader locale={locale} />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "JustGive",
              url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
              inLanguage: locale,
              description: t.homeMetaDescription,
            }),
          }}
        />
        <section className="hero-section" aria-labelledby="home-title">
          <div className="hero-copy">
            <p className="hero-kicker">{t.heroKicker}</p>
            <h1 id="home-title">
              <span>{t.heroPlace}</span>
              <em>{t.heroPlaceEm}</em>
            </h1>
            <p>{t.heroText}</p>
            <div className="hero-actions">
              <a className="button hero-cta" href="#give">{t.nav.give}<ArrowRight size={18} aria-hidden="true" /></a>
              <Link className="hero-secondary-link" href={`/${locale}/how-it-works`}>{t.howLink}<ArrowDown size={15} aria-hidden="true" /></Link>
            </div>
            <div className="hero-assurance" aria-label={t.heroAssuranceLabel}>
              <span><ShieldCheck size={16} aria-hidden="true" />{t.clearTransparent}</span>
              <span><Heart size={16} aria-hidden="true" />{t.alwaysOptional}</span>
            </div>
          </div>
          <AnimatedHeart locale={locale} />
        </section>

        <section className="give-section" aria-label={t.choose}>
          <div className="give-intro">
            <h2>{t.giveSectionTitle}</h2>
            <h3>{t.giveIntroTitle}</h3>
            <p>{t.giveIntroText}</p>
            <Link className="text-link" href={`/${locale}/payment-disclosure`}>{t.readDisclosure}<ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <ContributionForm locale={locale} />
        </section>

        <section className="content-section why-section" id="why">
          <div className="section-intro"><h2>{t.whyTitle}</h2><p>{t.whyText}</p></div>
          <div className="owner-ethics glass-panel owner-ethics-inline">
            <div className="owner-ethics-mark" aria-hidden="true"><Heart /></div>
            <div><h2 id="owner-ethics-title">{t.ownerEthicsTitle}</h2><p>{t.ownerEthics}</p></div>
          </div>
          <div className="reason-cards">
            <GlassCard><div className="reason-icon coral"><HandHeart aria-hidden="true" /></div><h3>{t.choiceTitle}</h3><p>{t.choiceBody}</p></GlassCard>
            <GlassCard><div className="reason-icon yellow"><Sparkles aria-hidden="true" /></div><h3>{t.happinessTitle}</h3><p>{t.happinessBody}</p></GlassCard>
            <GlassCard><div className="reason-icon ocean"><ShieldCheck aria-hidden="true" /></div><h3>{t.honestTitle}</h3><p>{t.honestBody}</p></GlassCard>
          </div>
        </section>

        <section className="steps-section" id="how">
          <div><h2>{t.howTitle}</h2><p>{t.stepsLead}</p><Link className="text-link" href={`/${locale}/how-it-works`}>{t.fullProcess}<ArrowRight size={16} aria-hidden="true" /></Link></div>
          <ol>{t.steps.map((step, index) => <li key={step}><span aria-hidden="true">0{index + 1}</span>{step}<CheckCircle2 size={19} aria-hidden="true" /></li>)}</ol>
        </section>

        <section className="wall-preview">
          <div className="wall-copy"><h2>{t.wallTitle}</h2><p>{t.wallText}</p><Link className="text-link" href={`/${locale}/wall-of-kindness`}>{t.wallLink}<ArrowRight size={16} aria-hidden="true" /></Link></div>
          <div className="wall-preview-messages" aria-label={t.wallTitle}>
            {wallMessages?.length ? wallMessages.map((message) => <figure className="wall-message-card" key={message.id}><Flower2 size={21} aria-hidden="true" /><blockquote>{message.body}</blockquote>{message.pass_it_on && <p className="pass-it-on"><Sparkles size={14} aria-hidden="true" />{message.pass_it_on}</p>}<figcaption>{new Date(message.created_at).toLocaleDateString(locale === "en" ? "en-IN" : "hi-IN")}<MessageAppreciationButton id={message.id} count={message.appreciation_count} locale={locale}/></figcaption></figure>) : <div className="quote-card"><Flower2 size={27} className="wall-mark" aria-hidden="true" /><p>{t.emptyWall}</p><span className="quote-by">{t.wallName}</span></div>}
          </div>
        </section>

        {visualFlags.get("kindness_universe")?.enabled !== false && <KindnessVisuals count={verifiedCount} locale={locale} />}
        {dailyMoment && <section className="daily-moment glass-panel" aria-labelledby="daily-moment-title"><span className="eyebrow">{t.dailyMomentEyebrow}</span><h2 id="daily-moment-title">{dailyMoment.title}</h2><p>{dailyMoment.body}</p></section>}

        <section className="faq-section">
          <h2>{t.faqTitle}</h2>
          <div className="faq-grid">{t.faq.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div>
          <Link className="stats-inline" href={`/${locale}/transparency`}>
            <span className="stats-icon"><ShieldCheck size={22} aria-hidden="true" /></span>
            <span><strong>{t.statsTitle}</strong><span>{t.statsLink}</span></span>
            <ArrowRight aria-hidden="true" />
          </Link>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
