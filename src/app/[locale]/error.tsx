"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { inlineCopy } from "@/lib/inline-copy";

export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const pathname = usePathname();
  const locale: Locale = pathname.startsWith("/hi-Latn") ? "hi-Latn" : pathname.startsWith("/hi") ? "hi" : "en";
  useEffect(() => {
    console.error("Localized page error", error.digest);
  }, [error]);
  return (
    <main className="page-main" role="alert">
      <h1>{inlineCopy(locale, "कुछ गलत हो गया", "Something went wrong")}</h1>
      <p>{inlineCopy(locale, "यह पृष्ठ लोड नहीं हो सका। कृपया फिर कोशिश करें।", "We couldn’t load this page. Please try again.")}</p>
      <button className="button" onClick={reset}>
        {inlineCopy(locale, "फिर कोशिश करें", "Try again")}
      </button>
    </main>
  );
}