import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
export function generateStaticParams(){return [{locale:"en"},{locale:"hi"},{locale:"hi-Latn"}];}
export default async function LocaleLayout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}) {const {locale}=await params;if(!isLocale(locale))notFound();const devanagari=locale==="hi";return <div lang={locale} className={devanagari?"locale-hindi":"locale-english"}>{children}</div>;}
