"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { inlineCopy } from "@/lib/inline-copy";

export default function LocaleNotFound() {
  const pathname = usePathname();
  const locale: Locale = pathname.startsWith("/hi-Latn") ? "hi-Latn" : pathname.startsWith("/hi") ? "hi" : "en";
  return (
    <main className="page-main">
      <span className="eyebrow">404</span>
      <h1>{inlineCopy(locale, "यह पृष्ठ नहीं मिला", "This page was not found")}</h1>
      <p>
        {inlineCopy(
          locale,
          "आप जिस पृष्ठ की तलाश कर रहे हैं वह मौजूद नहीं है या हटा दिया गया है।",
          "The page you are looking for does not exist or has been moved.",
        )}
      </p>
      <Link className="button" href={`/${locale}`}>
        {inlineCopy(locale, "मुखपृष्ठ पर जाएँ", "Go to the homepage")}
      </Link>
    </main>
  );
}