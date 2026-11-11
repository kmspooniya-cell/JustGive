import Link from "next/link";
import { Menu } from "lucide-react";
import { getMessages, type Locale } from "@/lib/i18n";
import { LanguageSwitch } from "./language-switch";
export function GlassNavigation({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  const nav=<><Link href={`/${locale}/about`}>{t.nav.about}</Link><Link href={`/${locale}/how-it-works`}>{t.nav.how}</Link><Link href={`/${locale}/wall-of-kindness`}>{t.nav.wall}</Link><Link href={`/${locale}/transparency`}>{t.nav.transparency}</Link><Link href={`/${locale}/contact`}>{t.nav.contact}</Link></>;
  return <header className="site-header"><div className="site-nav-shell"><Link className="wordmark brand-lockup" href={`/${locale}`} aria-label={t.brand}><svg className="brand-symbol" viewBox="0 0 48 48" aria-hidden="true"><g className="brand-orbit"><circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeDasharray="93 20" strokeLinecap="round" /></g><path d="M24 35.2c-2.4-2.2-10.1-8.1-10.1-14.2 0-3.5 2.2-6 5.5-6 2 0 3.6 1.1 4.6 2.8 1-1.7 2.6-2.8 4.6-2.8 3.3 0 5.5 2.5 5.5 6 0 6.1-7.7 12-10.1 14.2Z" fill="#FF8B78" /><path d="M18.5 21.1c.4-1.5 1.3-2.3 2.7-2.5" fill="none" stroke="#FFF5E8" strokeWidth="1.4" strokeLinecap="round" opacity=".9" /><circle cx="39" cy="15.2" r="3" fill="#B8F0DF" stroke="#087F8C" strokeWidth="1.2" /></svg><span>{t.brand}</span></Link><nav className="desktop-nav" aria-label={locale === "hi" ? "मुख्य नेविगेशन" : "Main navigation"}>{nav}</nav><div className="header-actions"><LanguageSwitch locale={locale}/><Link className="button button-small" href={`/${locale}#give`}>{t.nav.give}</Link></div><details className="mobile-nav"><summary aria-label={locale === "hi" ? "नेविगेशन खोलें" : "Open navigation"}><Menu size={21}/></summary><nav aria-label={locale === "hi" ? "मोबाइल नेविगेशन" : "Mobile navigation"}>{nav}<LanguageSwitch locale={locale}/><Link className="button" href={`/${locale}#give`}>{t.nav.give}</Link></nav></details></div></header>;
}

export const SiteHeader = GlassNavigation;
