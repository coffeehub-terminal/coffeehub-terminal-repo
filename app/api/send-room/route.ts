import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { to, roomName, buyerLink, offers } = await req.json();
    if (!to) return NextResponse.json({ error: "Missing to" }, { status: 400 });
    if (!process.env.RESEND_API_KEY) return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });

    const from = process.env.RESEND_FROM || "CoffeeHub <onboarding@resend.dev>";
    
    // Greeting name
    const greetingName = roomName?.split(" ")[0] || "there"
    
    // Offers list - keep your current logic but styled for golden template
    const offersList = (offers || []).map((o:any)=> 
      `<li style="margin:6px 0;font-size:14px;">${o.lot_number} • ${o.origin} • $${o.price_per_kg ?? 0}/kg ${o.variety ? `• ${o.variety}` : ""} ${o.process ? `• ${o.process}` : ""}</li>`
    ).join("");

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: `You're invited to "${roomName}" on CoffeeHub`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background-color:#ffffff;">
    <!-- Black Header - GOLDEN from screenshot -->
    <div style="background-color:#0a0f0d;padding:40px 40px 36px 40px;text-align:center;border-radius:12px 12px 0 0;">
      <div style="font-size:32px;font-weight:800;color:#fde68a;letter-spacing:-0.5px;line-height:1;">CoffeeHub</div>
      <div style="margin-top:12px;font-size:15px;color:#ffffff;opacity:0.9;">Private Coffee Buying Platform</div>
    </div>

    <div style="padding:40px 40px 32px 40px;">
      <div style="font-size:20px;font-weight:700;color:#111827;margin-bottom:8px;">Welcome to CoffeeHub</div>
      <div style="font-size:18px;font-weight:600;color:#22c55e;margin-bottom:24px;">${greetingName}</div>

      <p style="font-size:15px;line-height:1.6;color:#1f2937;margin:0 0 16px 0;">
        Our trading team has prepared a private buying room <strong>"${roomName}"</strong> containing a curated selection of specialty coffees for your review.
      </p>

      ${offersList ? `
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px 20px;margin:20px 0;">
        <div style="font-size:12px;font-weight:700;letter-spacing:0.5px;color:#6b7280;margin-bottom:8px;">INCLUDED LOTS • ${offers?.length || 0}</div>
        <ul style="margin:0;padding-left:18px;">${offersList}</ul>
      </div>` : ""}

      <p style="font-size:15px;line-height:1.6;color:#1f2937;margin:16px 0;">Within this room you can explore available lots, request pricing, request samples, and communicate directly with <strong>CoffeeHub</strong>.</p>

      <p style="font-size:15px;font-weight:500;color:#111827;margin:24px 0 12px 0;">Inside your private buying room you can:</p>
      <ul style="margin:0 0 32px 0;padding-left:20px;font-size:14px;line-height:1.8;color:#1f2937;">
        <li>Browse available specialty coffees</li>
        <li>View complete lot information</li>
        <li>Request pricing</li>
        <li>Request samples</li>
        <li>Communicate directly with our trading team</li>
      </ul>

      <!-- GREEN BUTTON - from screenshot -->
      <div style="text-align:center;margin:32px 0;">
        <a href="${buyerLink}" style="display:inline-block;background-color:#22c55e;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 32px;border-radius:8px;">Access Your Buying Room →</a>
      </div>

      <p style="font-size:13px;color:#111827;margin:32px 0 8px 0;">If the button doesn't work, copy this link into your browser:</p>
      <div style="background-color:#f3f4f6;border-radius:8px;padding:12px 16px;word-break:break-all;margin-bottom:32px;">
        <a href="${buyerLink}" style="font-size:13px;color:#2563eb;text-decoration:none;">${buyerLink}</a>
      </div>

      <div style="border-top:1px solid #e5e7eb;padding-top:24px;">
        <p style="font-size:13px;color:#6b7280;margin:0 0 16px 0;">Questions? Simply reply to this email and our trading team will be happy to assist you.</p>
        <div style="font-size:13px;color:#6b7280;">
          <div style="font-weight:700;color:#111827;"><span style="background:#111827;color:#fde68a;padding:1px 4px;border-radius:2px;">CoffeeHub</span> Colombia</div>
          <div style="margin-top:4px;">Private marketplace connecting specialty coffee producers with international buyers.</div>
          <div style="margin-top:12px;"><a href="mailto:trade@coffeehubcolombia.com" style="color:#2563eb;text-decoration:none;">trade@coffeehubcolombia.com</a></div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, id: data?.id });
  } catch (e:any) {
    console.error("SEND-ROOM ERROR", e)
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
