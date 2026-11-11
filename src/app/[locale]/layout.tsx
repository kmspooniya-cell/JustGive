import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
export function generateStaticParams(){return [{locale:"en"},{locale:"hi"}];}
export default async function LocaleLayout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}) {const {locale}=await params;if(!isLocale(locale))notFound();return <div lang={locale} className={locale==="hi"?"locale-hindi":"locale-english"}>{children}</div>;}
