"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { LanguageSwitch } from "./language-switch";
import type { Locale } from "@/lib/i18n";

export function MobileNav({ locale, nav, giveLabel }: { locale: Locale; nav: React.ReactNode; giveLabel: string }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const openLabel = locale !== "en" ? "नेविगेशन खोलें" : "Open navigation";
  const navLabel = locale !== "en" ? "मोबाइल नेविगेशन" : "Mobile navigation";

  useEffect(() => {
    const details = ref.current;
    if (!details) return;
    const close = () => {
      details.open = false;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !details.open) return;
      event.preventDefault();
      close();
      (details.querySelector("summary") as HTMLElement | null)?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (details.open && !details.contains(event.target as Node)) close();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return (
    <details className="mobile-nav" ref={ref}>
      <summary aria-label={openLabel}>
        <Menu size={21} />
      </summary>
      <nav aria-label={navLabel}>
        {nav}
        <LanguageSwitch locale={locale} />
        <Link className="button" href={`/${locale}#give`}>{giveLabel}</Link>
      </nav>
    </details>
  );
}