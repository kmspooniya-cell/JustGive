"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

const order: Locale[] = ["en", "hi", "hi-Latn"];
const label: Record<Locale, string> = { en: "English", hi: "हिंदी", "hi-Latn": "Hinglish" };
const shortLabel: Record<Locale, string> = { en: "EN", hi: "हिं", "hi-Latn": "Hi-Latn" };

export function LanguageSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const rest = pathname.replace(/^\/(en|hi|hi-Latn)(?=\/|$)/, "") || "";
  const index = order.indexOf(locale);
  const target = order[(index + 1) % order.length];
  const name = target === "hi" ? "हिन्दी में देखें" : target === "hi-Latn" ? "Hinglish mein dekhein" : "View in English";
  return (
    <Link className="lang-switch" href={`/${target}${rest}`} hrefLang={target} aria-label={name}>
      <span className="lang-switch-full">{label[target]}</span>
      <span className="lang-switch-short">{shortLabel[target]}</span>
    </Link>
  );
}