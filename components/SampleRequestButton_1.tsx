"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SampleRequestButton({ offers, roomId, buyerEmail, roomName }: { offers: any[]; roomId: string; buyerEmail: string; roomName?: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handle = async () => {
    if (!buyerEmail) return alert("Buyer email missing");
    if (!offers.length) return alert("No offers");
    setLoading(true);
    try {
      const sampleRequestId = crypto.randomUUID();
      const { error: srErr } = await supabase.from("SampleRequests").insert({
        id: sampleRequestId,
        room_id: roomId,
        buyer_email: buyerEmail,
        status: "Requested",
        notes: ""
      });
      if (srErr) throw srErr;

      const links = offers.map((o: any) => ({ sample_request_id: sampleRequestId, offer_id: o.id }));
      await supabase.from("SampleRequestOffers").insert(links);

      const { error: sErr } = await supabase.from("Samples").insert({
        sample_request_id: sampleRequestId,
        room_id: roomId,
        buyer_email: buyerEmail,
        status: "Requested",
        courier: "",
        tracking_number: ""
      });
      if (sErr) throw sErr;

      // Internal Activity for seller
      try{
        await supabase.from("Activities").insert({
          entity_type: "SampleRequest",
          entity_id: sampleRequestId,
          room_id: roomId,
          action: "SampleRequested",
          title: "New sample request",
          description: `${buyerEmail} requested samples in ${roomName||roomId}`,
          link: "/samples"
        });
      }catch{}

      setDone(true);
      setTimeout(()=>location.reload(), 600);
    } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  if (done) return <div className="text-[12px] bg-green-50 border border-green-200 text-green-700 rounded-full px-3 py-2">Sample Requested ✓ — Exporter will update tracking here</div>;
  return <button onClick={handle} disabled={loading} className="h-9 px-4 rounded-full bg-[#111] text-white text-[12px] font-medium disabled:opacity-50">{loading ? "Requesting..." : "Request Sample"}</button>;
}
