import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Locale } from "@/lib/i18n";
import { inlineCopy } from "@/lib/inline-copy";

const knownPages = new Set([
  "about",
  "how-it-works",
  "wall-of-kindness",
  "transparency",
  "contact",
  "privacy",
  "terms",
  "refund-policy",
  "payment-disclosure",
  "checkout",
  "payment-status",
  "receipt",
  "admin",
]);

function notFoundPage(locale: Locale) {
  return `<!doctype html><html lang="${locale}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${inlineCopy(locale, "पेज नहीं मिला", "Page not found")} — JustGive</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#FFF5E8;color:#173C42;font:16px/1.6 system-ui,sans-serif}main{max-width:34rem;padding:2rem;text-align:center}h1{font-size:2rem;margin:0 0 .5rem}a{display:inline-block;margin-top:1rem;padding:.8rem 1.2rem;border-radius:999px;background:#087F8C;color:#fff;text-decoration:none;font-weight:650}</style><main><h1>${inlineCopy(locale, "पेज नहीं मिला", "Page not found")}</h1><p>${inlineCopy(locale, "आप जो पेज खोज रहे हैं वह यहाँ नहीं है।", "We couldn’t find that page.")}</p><a href="/${locale}">${inlineCopy(locale, "होम पर लौटें", "Return home")}</a></main></html>`;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/") return NextResponse.redirect(new URL(`/${["hi","hi-Latn"].includes(request.cookies.get("locale")?.value ?? "") ? request.cookies.get("locale")?.value : "en"}`, request.url));
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next") || /\.[a-zA-Z0-9]+$/.test(pathname)) return NextResponse.next();
  const match = pathname.match(/^\/(en|hi|hi-Latn)(?=\/|$)/);
  if (match) {
    const rest = pathname.slice(match[0].length).split("/").filter(Boolean);
    if (rest.length > 0 && !knownPages.has(rest[0])) {
      return new NextResponse(notFoundPage(match[1] as Locale), {
        status: 404,
        headers: { "content-type": "text/html; charset=utf-8", "robots-tag": "noindex" },
      });
    }
    const headers=new Headers(request.headers);headers.set("x-locale",match[1]);
    const response=NextResponse.next({request:{headers}});
    response.cookies.set("locale",match[1],{sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:60*60*24*365});
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if(url&&key){
      const supabase=createServerClient(url,key,{cookies:{getAll:()=>request.cookies.getAll(),setAll(items: {name:string;value:string;options:CookieOptions}[]){items.forEach(({name,value,options})=>{request.cookies.set(name,value);response.cookies.set(name,value,options);});}}});
      await supabase.auth.getUser();
    }
    return response;
  }
  return NextResponse.redirect(new URL(`/en${pathname}`, request.url));
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest)(?!.*\\.[a-zA-Z0-9]+$).*)"] };
