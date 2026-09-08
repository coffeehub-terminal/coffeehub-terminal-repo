import { Resend } from "resend"
export async function POST(req:Request){
  try{ const {roomId,buyerEmail,offerIds}=await req.json(); if(!process.env.RESEND_API_KEY) return Response.json({ok:true,mock:true}); const resend=new Resend(process.env.RESEND_API_KEY); await resend.emails.send({from:"CoffeeHub <onboarding@resend.dev>",to:process.env.NOTIFY_EMAIL||"oreste.sangiovanni@gmail.com",subject:`Sample request ${roomId} from ${buyerEmail}`,html:`<p>Buyer ${buyerEmail} requested ${offerIds?.length} samples in ${roomId}</p><p>${offerIds?.join(", ")}</p>`}); return Response.json({ok:true}) }catch(e:any){ return Response.json({ok:true,error:e.message}) }
}
