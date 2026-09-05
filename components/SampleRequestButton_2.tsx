"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SampleRequestButton({ offers, roomId, buyerEmail }: { offers: any[]; roomId: string; buyerEmail: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handle = async () => {
    if (!buyerEmail) return alert("Buyer email missing - set in RoomParticipants");
    if (!offers.length) return alert("No offers");
    setLoading(true);
    try {
      const sampleRequestId = crypto.randomUUID();
      const { error: srErr } = await supabase.from("SampleRequests").insert({
        id: sampleRequestId,
        room_id: roomId,
        buyer_email: buyerEmail,
        status: "Approved",
        notes: ""
      });
      if (srErr) throw srErr;

      // Link offers - exact table SampleRequestOffers
      const links = offers.map((o: any) => ({
        sample_request_id: sampleRequestId,
        offer_id: o.id
      }));
      const { error: linkErr } = await supabase.from("SampleRequestOffers").insert(links);
      if (linkErr) console.warn("SampleRequestOffers:", linkErr.message);

      const { error: sErr } = await supabase.from("Samples").insert({
        sample_request_id: sampleRequestId,
        room_id: roomId,
        buyer_email: buyerEmail,
        status: "Preparing",
        courier: "",
        tracking_number: ""
      });
      if (sErr) throw sErr;

      setDone(true);
      location.reload();
    } catch (e: any) {
      alert(e.message);
    } finally { setLoading(false); }
  };

  if (done) return <div className="text-[12px] bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-3 py-1">Sample Request Submitted ✓</div>;
  return <button onClick={handle} disabled={loading} className="h-9 px-4 rounded-full bg-[#111] text-white text-[12px] font-medium disabled:opacity-50">{loading ? "Requesting..." : "Request Sample"}</button>;
}
