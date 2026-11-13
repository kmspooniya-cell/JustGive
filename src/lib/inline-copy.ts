import type { Locale } from "./i18n";
import { transliterateDevanagari } from "./transliterate";

// Pick the right register for a short inline string that has no catalog key yet.
// - hi: Devanagari as written
// - hi-Latn: the same Devanagari transliterated to readable Hinglish
// - en: the English fallback
export function inlineCopy(locale: Locale, deva: string, en: string): string {
  if (locale === "hi") return deva;
  if (locale === "hi-Latn") return transliterateDevanagari(deva);
  return en;
}