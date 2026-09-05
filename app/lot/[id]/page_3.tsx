"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LotPage() {
  const params = useParams() as { id?: string };
  const id = params?.id ? decodeURIComponent(params.id as string) : "";
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      let found: any = null;
      let r = await supabase.from("Lots").select("*").eq("id", id).maybeSingle();
      if (r.data) found = r.data;
      if (!found) {
        r = await supabase.from("Lots").select("*").eq("lot_number", id).maybeSingle();
        if (r.data) found = r.data;
      }
      if (!found) {
        r = await supabase.from("Offers").select("*").eq("id", id).maybeSingle();
        if (r.data) found = r.data;
      }
      if (!found) {
        r = await supabase.from("Offers").select("*").eq("lot_number", id).maybeSingle();
        if (r.data) found = r.data;
      }
      if (found?.lot_number) {
        const r2 = await supabase.from("Lots").select("*").eq("lot_number", found.lot_number).maybeSingle();
        if (r2.data) found = { ...found, ...r2.data };
      }
      setD(found);
    })();
  }, [id]);

  if (!d) return <main className="min-h-screen bg-[#F6F3EF] grid place-items-center text-[13px] text-[#888]">Loading {id}...</main>;

  return (
    <main className="min-h-screen bg-[#F5F1EB] text-[#111] antialiased selection:bg-[#111] selection:text-white">
      <div className="max-w-[760px] mx-auto px-5 py-7">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-[9px] bg-[#111] text-white grid place-items-center text-[11px] font-bold tracking-wide group-hover:scale-[0.98] transition">CH</div>
            <span className="text-[13.5px] font-semibold tracking-tight">CoffeeHub</span>
          </Link>
          <Link href="/" className="text-[12px] font-medium px-3.5 h-8 rounded-full bg-white border border-[#E8E2D9] grid place-items-center hover:bg-[#111] hover:text-white hover:border-[#111] transition">← Inventory</Link>
        </div>

        <div className="mt-7 relative overflow-hidden rounded-[28px] bg-[#111] text-white">
          <div className="absolute inset-0 opacity-[0.6]" style={{ background: "radial-gradient(600px 300px at 20% -10%, #2a2a2a 0%, transparent 60%), radial-gradient(500px 400px at 90% 0%, #3a3028 0%, transparent 70%)" }} />
          <div className="relative p-7 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[30px] md:text-[36px] font-semibold tracking-[-0.02em] leading-[0.95]">{d.lot_number}</h1>
                  <span className="h-6 px-2.5 rounded-full bg-white/10 border border-white/10 text-[11px] grid place-items-center backdrop-blur">{d.origin}</span>
                </div>
                <div className="mt-2.5 flex items-center gap-2 text-[12.5px] text-white/60">
                  <span>{d.Company || d.company_name || "CoffeeHub"}</span>
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                  <span>{d.farm || "Farm"} {d.producer ? `• ${d.producer}` : ""}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] tracking-[0.14em] uppercase text-white/40">FOB</div>
                <div className="text-[26px] font-semibold tracking-tight leading-none mt-1">${d.price_per_kg}<span className="text-[14px] font-medium text-white/50">/kg</span></div>
                <div className="mt-2 inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-white text-black text-[11px] font-medium">{d.required_bags || 0} bags • {d.score ? `${d.score} pts` : "no score"}</div>
              </div>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              {[d.variety && `Variety ${d.variety}`, d.process && `${d.process}`, d.altitude && `${d.altitude} masl`, d.farm && `Farm ${d.farm}`].filter(Boolean).map((t: any) => (
                <span key={t} className="h-7 px-3 rounded-full bg-white/10 border border-white/10 backdrop-blur text-[12px] grid place-items-center">{t}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-12 gap-3">
          <div className="col-span-12 md:col-span-7 rounded-[20px] bg-white border border-[#E8E2D9] p-5">
            <div className="text-[10px] tracking-[0.14em] uppercase text-[#A09B95]">Cup notes</div>
            <div className="mt-3 text-[15px] leading-[1.55] tracking-[-0.01em] text-[#1F1E1C] whitespace-pre-wrap">
              {d.cup_notes ? `“${d.cup_notes}”` : <span className="text-[#AAA]">No tasting notes yet.</span>}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2">
              <div className="rounded-[14px] bg-[#FBF8F3] border border-[#F0E9DE] p-3">
                <div className="text-[10px] uppercase tracking-widest text-[#A99F95]">Variety</div>
                <div className="text-[13px] font-medium mt-1 truncate">{d.variety || "—"}</div>
              </div>
              <div className="rounded-[14px] bg-[#FBF8F3] border border-[#F0E9DE] p-3">
                <div className="text-[10px] uppercase tracking-widest text-[#A99F95]">Process</div>
                <div className="text-[13px] font-medium mt-1 truncate">{d.process || "—"}</div>
              </div>
              <div className="rounded-[14px] bg-[#FBF8F3] border border-[#F0E9DE] p-3">
                <div className="text-[10px] uppercase tracking-widest text-[#A99F95]">Altitude</div>
                <div className="text-[13px] font-medium mt-1 truncate">{d.altitude ? `${d.altitude}` : "—"}</div>
              </div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-5 space-y-3">
            <div className="rounded-[20px] bg-white border border-[#E8E2D9] p-5">
              <div className="text-[10px] tracking-[0.14em] uppercase text-[#A09B95]">Lot dossier</div>
              <div className="mt-4 space-y-3">
                {[
                  ["Lot #", d.lot_number],
                  ["Origin", d.origin],
                  ["Company", d.Company || d.company_name],
                  ["Farm", d.farm],
                  ["Producer", d.producer || "—"],
                  ["Bags", d.required_bags ? `${d.required_bags} × 60kg` : "—"],
                  ["Score", d.score ? `${d.score}` : "—"],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex items-center justify-between text-[13px]">
                    <span className="text-[#8E8982]">{k}</span>
                    <span className="font-medium truncate ml-3 max-w-[140px] text-right">{String(v || "—")}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[20px] bg-[#111] text-white p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-white/50 uppercase tracking-widest">Total est.</div>
                <div className="text-[14px] font-medium mt-0.5">${d.price_per_kg && d.required_bags ? (Number(d.price_per_kg) * Number(d.required_bags) * 60).toLocaleString() : "—"} USD</div>
              </div>
              <div className="text-[11px] px-2.5 h-6 rounded-full bg-white/10 border border-white/10 grid place-items-center">{d.id?.slice(0, 8) || "—"}</div>
            </div>
          </div>
        </div>

        <div className="mt-5 text-center text-[11px] text-[#A99F95]">Created {d.created_at ? new Date(d.created_at).toLocaleDateString() : "—"} • CoffeeHub OS</div>
      </div>
    </main>
  );
}
