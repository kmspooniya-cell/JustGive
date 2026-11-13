import type {MetadataRoute} from "next";
const routes=["","about","how-it-works","transparency","wall-of-kindness","contact","privacy","terms","refund-policy","payment-disclosure"];
export default function sitemap():MetadataRoute.Sitemap{const base=process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000";return ["en","hi","hi-Latn"].flatMap(locale=>routes.map(route=>({url:`${base}/${locale}${route?`/${route}`:""}`,lastModified:new Date(),alternates:{languages:{en:`${base}/en${route?`/${route}`:""}`,hi:`${base}/hi${route?`/${route}`:""}`}}})));}
