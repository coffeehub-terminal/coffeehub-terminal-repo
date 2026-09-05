import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
export async function POST(req: NextRequest) {
  try {
    const { to, roomName, courier, tracking, status, buyerLink } = await req.json();
    if (!to) return NextResponse.json({ error: "Missing buyer email" }, { status: 400 });
    if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
    const from = process.env.RESEND_FROM || "CoffeeHub <trade@coffeehubcolombia.com>";
    const { data, error } = await resend.emails.send({
      from, to,
      subject: `📦 Sample Update: ${status} - ${roomName}`,
      html: `<div style="font-family:Inter,sans-serif; max-width:600px; padding:24px;"><h2>Your coffee sample is ${status}!</h2><p>Room: <b>${roomName}</b></p><div style="background:#F6FEF9; border:1px solid #C6F6D5; border-radius:12px; padding:16px; margin:16px 0;"><p style="margin:4px 0;"><b>Courier:</b> ${courier||"-"}</p><p style="margin:4px 0;"><b>Tracking:</b> ${tracking||"-"}</p><p style="margin:4px 0;"><b>Status:</b> ${status}</p></div><a href="${buyerLink}" style="background:#111;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;">Track in Buyer Portal →</a><p style="color:#999; font-size:12px; margin-top:16px;">${buyerLink}</p></div>`
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok:true, id:data?.id });
  } catch(e:any){ return NextResponse.json({ error:e.message }, { status:500 }); }
}
