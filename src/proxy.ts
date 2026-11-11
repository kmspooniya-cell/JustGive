import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/") return NextResponse.redirect(new URL(`/${request.cookies.get("locale")?.value === "hi" ? "hi" : "en"}`, request.url));
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next")) return NextResponse.next();
  const match = pathname.match(/^\/(en|hi)(?=\/|$)/);
  if (match) {
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
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest).*)"] };
