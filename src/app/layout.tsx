import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { AccessibilityTools } from "@/components/accessibility-tools";
export const metadata: Metadata = { title: { default: "JustGive — Give Freely. Feel Good. Repeat.", template: "%s | JustGive" }, description: "A personal voluntary contribution website. Give freely, with no purchase, pressure, or reward.", metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"), openGraph: { siteName: "JustGive", type: "website", title: "JustGive — Give Freely. Feel Good. Repeat.", description: "A little giving. A little happiness." } };
export default async function RootLayout({children}:{children:React.ReactNode}) { const locale=(await headers()).get("x-locale")==="hi"?"hi":"en";return <html lang={locale}><body><ServiceWorkerRegister/><AccessibilityTools locale={locale}/>{children}</body></html>; }
