import { notFound } from "next/navigation";
import { isLocale,getMessages } from "@/lib/i18n";
import { SiteHeader } from "@/components/site-header";
import { AdminLogin } from "@/components/admin-login";
export default async function Login({params}:{params:Promise<{locale:string}>}){const {locale:raw}=await params;if(!isLocale(raw))notFound();return <><SiteHeader locale={raw}/><main className="page-main"><h1>{getMessages(raw).login}</h1><p className="lead">Sign-in is available only when Supabase is configured. There is no public admin registration.</p><AdminLogin locale={raw}/></main></>;}
