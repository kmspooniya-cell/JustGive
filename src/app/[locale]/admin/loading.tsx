"use client";

import { usePathname } from "next/navigation";
import { getMessages, isLocale } from "@/lib/i18n";

export default function AdminLoading() {
  const pathLocale = usePathname().split("/")[1];
  const locale = isLocale(pathLocale) ? pathLocale : "en";
  return (
    <main className="admin-shell" aria-busy="true">
      <p className="status-banner" role="status">{getMessages(locale).adminFinancial.loading}</p>
    </main>
  );
}
