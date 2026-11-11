"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
export function LanguageSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname(); const rest = pathname.replace(/^\/(en|hi)(?=\/|$)/, "") || "";
  const target: Locale = locale === "en" ? "hi" : "en";
  return <Link className="lang-switch" href={`/${target}${rest}`} hrefLang={target} aria-label={target === "hi" ? "हिन्दी में देखें" : "View in English"}>{target === "hi" ? "हिंदी" : "English"}</Link>;
}
