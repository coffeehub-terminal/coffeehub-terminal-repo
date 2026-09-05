import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
export async function POST(req: NextRequest) {
  try {
    const { buyerEmail, roomId, roomName, sampleRequestId, offers, buyerLink } = await req.json();
    if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
    const from = process.env.RESEND_FROM || "CoffeeHub <trade@coffeehubcolombia.com>";
    const to = process.env.SELLER_NOTIFY_EMAIL || "trade@coffeehubcolombia.com";
    const offersList = (offers || []).map((o:any)=> `<li>${o.lot_number} • ${o.origin} • ${o.variety||""} • $${o.price_per_kg||0}/kg</li>`).join("");
    const { data, error } = await resend.emails.send({
      from, to,
      subject: `🔔 New Sample Request - ${roomName||roomId} from ${buyerEmail}`,
      html: `<div style="font-family:Inter,sans-serif; max-width:600px; padding:24px;"><h2>New Sample Request</h2><p><b>Buyer:</b> ${buyerEmail}</p><p><b>Room:</b> ${roomName||roomId} (${roomId})</p><p><b>Request ID:</b> ${sampleRequestId}</p><ul>${offersList}</ul><p><a href="${buyerLink||"https://app.coffeehubcolombia.com/samples"}" style="background:#111;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;">Go to Samples →</a></p></div>`
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok:true, id:data?.id });
  } catch(e:any){ return NextResponse.json({ error:e.message }, { status:500 }); }
}
