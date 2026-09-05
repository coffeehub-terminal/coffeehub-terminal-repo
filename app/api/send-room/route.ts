import { Resend } from "resend"
export async function POST(req:Request){
  try{ const {to,buyerLink,roomName}=await req.json(); if(!to) return Response.json({ok:true}); if(!process.env.RESEND_API_KEY) {console.log("MOCK",to,buyerLink); return Response.json({ok:true,mock:true})} const resend=new Resend(process.env.RESEND_API_KEY); await resend.emails.send({from:"CoffeeHub <onboarding@resend.dev>",to,subject:`Your private room: ${roomName}`,html:`<p>Room ${roomName} ready:</p><p><a href="${buyerLink}">${buyerLink}</a></p>`}); return Response.json({ok:true}) }catch(e:any){ return Response.json({ok:true,error:e.message}) }
}
