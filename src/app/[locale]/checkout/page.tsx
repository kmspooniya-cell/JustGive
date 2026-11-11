import { notFound } from "next/navigation";
import { getMessages, isLocale } from "@/lib/i18n";
import { SiteHeader } from "@/components/site-header";
import { CheckoutActions } from "@/components/checkout-actions";
export default async function Checkout({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<{order?:string;amount?:string}>}){const {locale:raw}=await params;const {order,amount}=await searchParams;if(!isLocale(raw))notFound();const t=getMessages(raw);return <><SiteHeader locale={raw}/><main className="page-main checkout-card"><div className="checkout-simulation-tag"><span className="demo-dot" aria-hidden="true"/>{t.demo}</div><h1>{t.checkoutTitle}</h1><div className="checkout-amount">₹{Number(amount)||0}</div><p className="lead">{t.checkoutBody}</p><p>{t.recipient}</p><CheckoutActions order={order??""} amount={Number(amount)||0} locale={raw}/><p className="tiny-note">{t.voluntary}</p></main></>;}
