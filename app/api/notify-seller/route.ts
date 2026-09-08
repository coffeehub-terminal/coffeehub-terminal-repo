import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest){
  try{
    const body = await req.json();
    console.log("🔔 NOTIFY-SELLER payload:", body);
    
    const { type, lot_id, lot_ref, room_token, buyer_name, buyer_email, price, lots, message } = body;
    
    if(!process.env.RESEND_API_KEY){
      console.log("⚠️ RESEND_API_KEY missing - mock save");
      return NextResponse.json({ ok: true, mock: true, saved: true, to: "aviancoffee@gmail.com", subject: `${type} ${lot_ref||lots}` });
    }

    const from = process.env.RESEND_FROM || "CoffeeHub <onboarding@resend.dev>";
    const sellerEmail = process.env.SELLER_NOTIFY_EMAIL || "aviancoffee@gmail.com";
    
    const subject = type==="BUY" 
      ? `BUY: ${buyer_name} - ${lot_ref} $${price}/kg`
      : type==="SAMPLE_REQUEST"
      ? `SAMPLE REQUEST: ${buyer_name} - ${lots||lot_ref}`
      : `Buyer action ${type}: ${buyer_name}`;

    const html = `
      <div style="font-family:Inter,Helvetica,Arial,sans-serif; max-width:600px; margin:0 auto; padding:24px; border:1px solid black; border-radius:16px;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:24px;">
          <div style="width:28px; height:28px; background:#111; color:#fff; border-radius:8px; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px;">CH</div>
          <span style="font-weight:600;">CoffeeHub</span>
        </div>
        <h2 style="font-size:20px; margin:0 0 12px;">${subject}</h2>
        <p style="font-size:14px; color:#555;">Buyer: <b>${buyer_name}</b> (${buyer_email})</p>
        <p style="font-size:14px; color:#555;">Room: <b>${room_token}</b> - Lot: <b>${lot_ref||lots||""}</b> - Price: $${price||""}/kg</p>
        <p style="font-size:13px; color:#444; margin-top:12px;">${message||""}</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000"}/r/${room_token}" style="display:inline-block; margin-top:16px; background:#111; color:#fff; padding:10px 18px; border-radius:999px; text-decoration:none; font-size:13px;">Open buyer room →</a>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000"}" style="display:inline-block; margin-top:16px; margin-left:8px; border:1px solid black; color:#111; padding:10px 18px; border-radius:999px; text-decoration:none; font-size:13px;">Seller OS →</a>
        <p style="font-size:11px; color:#999; margin-top:32px;">CoffeeHub Green OS • Room link: ${process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000"}/r/${room_token}</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from,
      to: sellerEmail,
      subject,
      html
    });

    if(error){
      console.log("Resend error but still save:", error);
      return NextResponse.json({ ok: true, saved: true, emailError: error, to: sellerEmail, warning: "Email failed but saved", subject });
    }

    console.log("✅ Email sent to", sellerEmail, data);
    return NextResponse.json({ ok: true, saved: true, id: data?.id, to: sellerEmail, subject });
    
  }catch(e:any){
    console.error("notify-seller error", e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
