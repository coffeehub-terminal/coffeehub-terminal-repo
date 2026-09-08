import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { to, roomName, buyerLink, offers } = await req.json();
    if (!to) return NextResponse.json({ error: "Missing to" }, { status: 400 });
    if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });

    const from = process.env.RESEND_FROM || "CoffeeHub <trade@coffeehubcolombia.com>";

    const offersList = (offers || []).map((o:any)=> `<li style="margin:4px 0;">${o.lot_number} • ${o.origin} • $${o.price_per_kg ?? 0}/kg • ${o.variety || ""} ${o.process ? `• ${o.process}` : ""}</li>`).join("");

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: `You're invited to "${roomName}" on CoffeeHub`,
      html: `
        <div style="font-family:Inter,Helvetica,Arial,sans-serif; max-width:600px; margin:0 auto; padding:24px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:24px;">
            <div style="width:28px; height:28px; background:#111; color:#fff; border-radius:8px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:11px;">CH</div>
            <span style="font-weight:600; font-size:14px;">CoffeeHub</span>
          </div>
          <h2 style="font-size:20px; margin:0 0 12px;">You're invited to "${roomName}"</h2>
          <p style="font-size:14px; color:#555; line-height:1.5;">A new selection of coffees has been shared with you.</p>
          ${offersList ? `<ul style="font-size:13px; padding-left:16px; margin:16px 0;">${offersList}</ul>` : ""}
          <a href="${buyerLink}" style="display:inline-block; margin-top:16px; background:#111; color:#fff; padding:10px 18px; border-radius:999px; text-decoration:none; font-size:13px; font-weight:500;">View Buyer Portal →</a>
          <p style="font-size:12px; color:#999; margin-top:24px; word-break:break-all;">Link: ${buyerLink}</p>
          <p style="font-size:11px; color:#AAA; margin-top:32px;">CoffeeHub Green OS</p>
        </div>
      `,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, id: data?.id });
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
