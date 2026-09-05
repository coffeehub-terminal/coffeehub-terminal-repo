"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LotPage() {
  const params = useParams() as { id?: string };
  const id = params?.id ? decodeURIComponent(params.id as string) : "";
  const [lot, setLot] = useState<any>(null);
  const [offer, setOffer] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      let foundOffer: any = null;
      let foundLot: any = null;
      const { data: offById } = await supabase.from("Offers").select("*").eq("id", id).maybeSingle();
      if (offById) foundOffer = offById;
      if (!foundOffer) {
        const { data } = await supabase.from("Offers").select("*").eq("lot_number", id).maybeSingle();
        if (data) foundOffer = data;
      }
      if (!foundLot) {
        const { data } = await supabase.from("Lots").select("*").eq("id", id).maybeSingle();
        if (data) foundLot = data;
      }
      if (!foundLot) {
        const { data } = await supabase.from("Lots").select("*").eq("lot_number", id).maybeSingle();
        if (data) foundLot = data;
      }
      if (!foundLot && foundOffer?.lot_number) {
        const { data } = await supabase.from("Lots").select("*").eq("lot_number", foundOffer.lot_number).maybeSingle();
        if (data) foundLot = data;
      }
      setLot(foundLot);
      setOffer(foundOffer);
    })();
  }, [id]);

  if (!lot && !offer) return <main className="min-h-screen bg-[#FBFBF9] flex items-center justify-center text-[13px] text-[#888]">Loading lot {id}...</main>;

  const d = { ...offer, ...lot, price_per_kg: lot?.price_per_kg ?? offer?.price_per_kg };
  const price = d.price_per_kg ?? 0;
  const score = d.score;

  return (
    <main className="min-h-screen bg-[#F7F5F2] text-[#111] antialiased">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-[#EAE6E1]">
        <div className="max-w-[1120px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[8px] bg-[#111] text-white flex items-center justify-center font-bold text-[11px]">CH</div>
            <span className="font-semibold text-[14px] tracking-tight">CoffeeHub</span>
            <span className="hidden md:inline-flex ml-2 text-[10px] px-2 py-0.5 rounded-full bg-[#F5F3EF] border border-[#EAE6E1] text-[#8A857E]">LOT DETAIL</span>
          </Link>
          <Link href="/" className="h-8 px-3.5 rounded-full border border-[#E8E8E8] text-[12px] font-medium flex items-center hover:bg-[#111] hover:text-white transition">← Back to inventory</Link>
        </div>
      </div>

      <div className="max-w-[1120px] mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[28px] font-semibold tracking-tight leading-none">{d.lot_number || "Unnamed"}</h1>
              {score && <span className="inline-flex h-6 px-2.5 rounded-full bg-[#111] text-white text-[11px] font-medium">{score} pts</span>}
              <span className="inline-flex h-6 px-2.5 rounded-full bg-white border border-[#E8E8E8] text-[11px] text-[#666]">{offer?.status || "inventory"}</span>
            </div>
            <div className="flex items-center gap-2 mt-2.5 text-[13px] text-[#777]">
              <span>{d.origin || "Origin"} • {d.Company || d.company_name || "CoffeeHub"}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-widest text-[#9A9590]">FOB Price</div>
            <div className="text-[22px] font-semibold leading-none mt-1">${price}/kg</div>
            <div className="text-[11px] text-[#9A9590] mt-1">{d.required_bags ? `${d.required_bags} bags • ${Number(d.required_bags)*60} kg est.` : ""}</div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-[0_1px_0_0_rgba(0,0,0,0.04),0_8px_24px_-16px_rgba(0,0,0,0.2)] overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[#F0EBE3] border-b border-[#F0EBE3] bg-[#FCFBF9]">
            {[
              { label: "Farm", value: d.farm || "—" },
              { label: "Producer", value: d.producer || "—" },
              { label: "Variety", value: d.variety || "—" },
              { label: "Process", value: d.process || "—" },
              { label: "Altitude", value: d.altitude ? `${d.altitude} masl` : "—" },
              { label: "Harvest", value: d.harvest_year || "—" },
              { label: "Bags", value: d.required_bags ? `${d.required_bags} × 60kg` : "—" },
              { label: "Certs", value: d.certifications || "—" },
            ].map((f) => (
              <div key={f.label} className="px-6 py-4">
                <div className="text-[10px] font-medium tracking-widest uppercase text-[#A09B95]">{f.label}</div>
                <div className="text-[13px] font-medium mt-1.5 truncate">{f.value}</div>
              </div>
            ))}
          </div>

          <div className="p-6 md:p-8">
            <div className="text-[11px] font-medium tracking-widest uppercase text-[#A09B95] mb-3">Cup Profile</div>
            {d.cup_notes ? (
              <div className="text-[14px] leading-relaxed text-[#222] bg-[#F7F5F2] border border-[#F0EBE3] rounded-[14px] p-4">{d.cup_notes}</div>
            ) : (
              <div className="text-[13px] text-[#999] bg-[#FBFAF8] border border-dashed border-[#E8E2D9] rounded-[14px] p-4">No cup notes.</div>
            )}

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-[14px] border border-[#EAE6E1] p-4"><div className="text-[10px] uppercase tracking-widest text-[#A09B95]">Score</div><div className="text-[18px] font-semibold mt-1">{score || "—"}</div></div>
              <div className="rounded-[14px] border border-[#EAE6E1] p-4"><div className="text-[10px] uppercase tracking-widest text-[#A09B95]">Price</div><div className="text-[18px] font-semibold mt-1">${price}</div></div>
              <div className="rounded-[14px] border border-[#EAE6E1] p-4"><div className="text-[10px] uppercase tracking-widest text-[#A09B95]">Origin</div><div className="text-[13px] font-medium mt-1 truncate">{d.origin || "—"}</div></div>
            </div>

            <div className="mt-6 rounded-[16px] border border-[#EAE6E1] bg-[#FCFBF9] p-4">
              <div className="text-[10px] uppercase tracking-widest text-[#A09B95] mb-2">System</div>
              <div className="text-[11px] font-mono space-y-1 text-[#666] break-all">
                <div>Lot uuid: {lot?.id || "—"}</div>
                <div>Offer id: {offer?.id || "—"}</div>
                <div>Lot #: {d.lot_number}</div>
                <div>Created: {d.created_at ? new Date(d.created_at).toLocaleString() : "—"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
