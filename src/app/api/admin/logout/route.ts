import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/lib/supabase/server";
export async function POST(request:Request){const supabase=await createSupabaseServerClient();if(supabase)await supabase.auth.signOut();const locale=new URL(request.url).searchParams.get("locale")==="hi"?"hi":"en";return NextResponse.redirect(new URL(`/${locale}/admin/login`,request.url),303);}
