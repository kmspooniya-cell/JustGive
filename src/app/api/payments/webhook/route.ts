import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments/provider";
export async function POST(request:Request){const raw=await request.text();const signature=request.headers.get("x-provider-signature");const provider=getPaymentProvider();if(!provider||!(await provider.verifyWebhook(raw,signature)))return NextResponse.json({error:"Invalid webhook signature."},{status:401});return NextResponse.json({received:true});}
