"use client";
import { useEffect, useState } from "react";
import React from "react";
import { supabase } from "@/lib/supabase";

export default function LotPage({ params }: any) {
  // Next.js 15 gives params as Promise
  const resolvedParams = (params as any)?.then ? (React as any).use(params) : params as any;
  const [lot, setLot] = useState<any>(null);
  const [offer, setOffer] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = decodeURIComponent(resolvedParams.id);
    (async () => {
      // 1) Lots by uuid
      let lotData: any = null;
      let offerData: any = null;
      
      const tryLotsById = await supabase.from("Lots").select("*").eq("id", id).maybeSingle();
      if (tryLotsById.data) lotData = tryLotsById.data;
      
      // 2) Lots by lot_number (your link might use lot_number)
      if (!lotData) {
        const { data } = await supabase.from("Lots").select("*").eq("lot_number", id).maybeSingle();
        if (data) lotData = data;
      }
      // 3) Offers by id (OFF-...)
      const { data: offById } = await supabase.from("Offers").select("*").eq("id", id).maybeSingle();
      if (offById) offerData = offById;
      
      // 4) Offers by lot_number
      if (!offerData && !lotData) {
        const { data } = await supabase.from("Offers").select("*").eq("lot_number", id).maybeSingle();
        if (data) offerData = data;
      }
      // 5) cross-fill
      if (!lotData && offerData?.lot_number) {
        const { data } = await supabase.from("Lots").select("*").eq("lot_number", offerData.lot_number).maybeSingle();
        if (data) lotData = data;
      }
      if (!offerData && lotData?.lot_number) {
        const { data } = await supabase.from("Offers").select("*").eq("lot_number", lotData.lot_number).maybeSingle();
        if (data) offerData = data;
      }

      if (!lotData && !offerData) {
        setError(`Not found for "${id}". Checked Lots.id, Lots.lot_number, Offers.id, Offers.lot_number`);
      }
      setLot(lotData);
      setOffer(offerData);
    })();
  }, [resolvedParams.id]);

  if (error) return <main className="p-10 text-sm"><div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">{error}</div><a href="/" className="mt-4 inline-block text-xs border px-3 py-1 rounded">← Back</a></main>;
  if (!lot && !offer) return <main className="p-10 text-sm">Loading lot {resolvedParams.id}...</main>;

  const d = lot || offer;
  const price = d?.price_per_kg ?? 0;

  return (
    <main className="min-h-screen bg-[#FBFBF9] p-10">
      <div className="max-w-2xl bg-white border rounded-[16px] p-6">
        <h1 className="font-bold text-lg">{d.lot_number} • {d.origin || d.Company || d.company_name}</h1>
        <div className="mt-4 text-sm space-y-1">
          <div>Price: ${price}/kg</div>
          <div>Company: {d.Company || d.company_name || "-"}</div>
          <div>Farm: {d.farm || "-"}</div>
          <div>Producer: {d.producer || "-"}</div>
          <div>Variety: {d.variety || "-"}</div>
          <div>Process: {d.process || "-"}</div>
          <div>Bags: {d.required_bags || "-"}</div>
          <div>Score: {d.score || "-"}</div>
          <div>Altitude: {d.altitude || "-"}</div>
        </div>
        {d.cup_notes && <div className="mt-4 text-sm bg-[#FBFBF9] p-3 rounded">{d.cup_notes}</div>}
        <a href="/" className="mt-6 inline-block text-xs border px-3 py-1.5 rounded-full">← Back to inventory</a>
        <details className="mt-6 text-[11px]"><summary>Debug</summary><pre className="mt-2 bg-[#F5F5F5] p-2 rounded overflow-auto">{JSON.stringify({ lot, offer }, null, 2)}</pre></details>
      </div>
    </main>
  );
}
