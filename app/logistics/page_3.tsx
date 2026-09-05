"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LogisticsPage(){
  const [rows,setRows]=useState<any[]>([]);
  const [contracts,setContracts]=useState<any>({});
  const [selected,setSelected]=useState<any>(null);
  const [form,setForm]=useState<any>({});
  const [saving,setSaving]=useState(false);
  const [errorMsg,setErrorMsg]=useState("");

  const load = async()=>{
    const {data, error} = await supabase.from("Logistics").select("*").order("id",{ascending:false}).limit(100);
    if(error){ setErrorMsg(error.message); return; }
    if(data){
      setRows(data);
      const cIds = [...new Set(data.map((r:any)=>r.contract_id).filter(Boolean))].map((v:any)=>String(v));
      if(cIds.length){
        const {data: cData} = await supabase.from("Contracts").select("*").in("id", cIds);
        const map:any={}; cData?.forEach((c:any)=> map[String(c.id)]=c);
        setContracts(map);
      }
    }
  };
  useEffect(()=>{ load(); },[]);

  const open = (l:any)=>{
    setSelected(l);
    setErrorMsg("");
    setForm({
      status: l.status||"Booking Requested",
      booking_number: l.booking_number||"",
      container_number: l.container_number||"",
      container_size: l.container_size||"20FT",
      vessel_name: l.vessel_name||l.vessel||"",
      eta: l.eta ? new Date(l.eta).toISOString().slice(0,10) : "",
      etd: l.etd ? new Date(l.etd).toISOString().slice(0,10) : "",
      // Keep raw for display
      _raw: l
    });
  };

  const save = async()=>{
    if(!selected) return; setSaving(true); setErrorMsg("");
    // Only update columns that we KNOW exist in your table
    // Your table has: id, booking_number, container_number, container_size, vessel_name?, eta, etd, status, contract_id
    // We try minimal set first
    const tryPayloads = [
      { status: form.status, booking_number: form.booking_number||null, container_number: form.container_number||null, container_size: form.container_size||null, vessel_name: form.vessel_name||null, eta: form.eta ? new Date(form.eta).toISOString() : null, etd: form.etd ? new Date(form.etd).toISOString() : null },
      { status: form.status, booking_number: form.booking_number||null, container_number: form.container_number||null, container_size: form.container_size||null, vessel: form.vessel_name||null, eta: form.eta ? new Date(form.eta).toISOString() : null, etd: form.etd ? new Date(form.etd).toISOString() : null },
      { status: form.status, booking_number: form.booking_number||null, container_number: form.container_number||null },
      { status: form.status },
    ];
    let lastError:any = null;
    for(const payload of tryPayloads){
      const { error } = await supabase.from("Logistics").update(payload).eq("id", selected.id);
      if(!error){ setSelected(null); load(); setSaving(false); return; }
      lastError = error;
      // If error mentions column, try next smaller payload
      if(!error.message.includes("column") && !error.message.includes("schema")) break;
    }
    setErrorMsg(lastError?.message||"Save failed");
    setSaving(false);
  };

  const steps = ["Booking Requested","Booking Confirmed","Loaded","In Transit","Arrived","Delivered"];
  const currentIdx = steps.indexOf(form.status||selected?.status||"Booking Requested");

  return <main className="min-h-screen bg-[#FBFBF9] text-[#111]"><div className="max-w-[1280px] mx-auto p-6">
    <div className="flex justify-between items-center"><Link href="/" className="text-[12px] border bg-white px-3 py-1.5 rounded-full">← Seller OS</Link><h1 className="text-[16px] font-semibold">Logistics • {rows.length}</h1><Link href="/contracts" className="text-[12px] border bg-white px-3 py-1.5 rounded-full">← Contracts</Link></div>
    {errorMsg && <div className="mt-4 text-[12px] bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-[12px]">{errorMsg}</div>}
    <div className="mt-6 grid md:grid-cols-5 gap-6">
      <div className="md:col-span-3 bg-white border rounded-[16px] divide-y">
        {rows.map((l:any)=>{
          const contract = contracts[String(l.contract_id||"")];
          const isActive = selected?.id===l.id;
          return <div key={String(l.id)} onClick={()=>open(l)} className={`p-4 cursor-pointer hover:bg-[#FAFAF8] ${isActive?"bg-[#111] text-white":""}`}>
            <div className="flex justify-between items-start gap-2"><div className={`text-[13px] font-medium truncate ${isActive?"text-white":""}`}>{String(l.id).slice(0,10)} • {String(l.booking_number||"No booking")} • {contract?.contract_number||String(l.contract_id||"").slice(0,8)||"-"}</div><span className={`text-[10px] px-2.5 py-1 rounded-full border shrink-0 ${isActive?"bg-white text-black border-white": l.status==="Arrived"||l.status==="Delivered"?"bg-green-50 text-green-700 border-green-200":"bg-amber-50 text-amber-700 border-amber-200"}`}>{l.status||"Requested"}</span></div>
            <div className={`text-[11px] mt-1.5 flex flex-wrap gap-3 ${isActive?"text-white/60":"text-[#888]"}`}><span>Cont: {String(l.container_number||"-")} {String(l.container_size||"")}</span><span>Vessel: {String(l.vessel_name||l.vessel||"-")}</span><span>ETA: {l.eta?new Date(l.eta).toLocaleDateString():"-"}</span></div>
            <details className="mt-2"><summary className={`text-[10px] cursor-pointer ${isActive?"text-white/50":"text-[#999]"}`}>Show all Supabase fields</summary><pre className={`mt-2 text-[10px] p-2 rounded-[8px] overflow-auto max-h-40 ${isActive?"bg-white/10 text-white/80":"bg-[#F9F9F7] text-[#666]"}`}>{JSON.stringify(l, null, 2)}</pre></details>
          </div>
        })}
        {rows.length===0&&<div className="p-12 text-center text-[12px] text-[#999]">No logistics — create from /contracts after Signed</div>}
      </div>
      <div className="md:col-span-2 bg-white border rounded-[16px] p-5 h-fit sticky top-6">
        {!selected ? <div className="text-[12px] text-[#999] text-center py-10">← Select shipment to manage<br/><span className="text-[11px]">All Supabase columns will show here</span></div> : (<div>
          <div className="flex justify-between items-start"><h3 className="font-semibold text-[13px] break-all">{String(selected.id)}</h3><button onClick={()=>setSelected(null)} className="text-[11px] border px-2.5 py-1 rounded-full shrink-0 ml-2">x</button></div>
          <div className="text-[11px] text-[#666] mt-1">Contract: {contracts[String(selected.contract_id||"")]?.contract_number||String(selected.contract_id||"-")}</div>
          <div className="mt-5"><div className="text-[11px] font-medium uppercase tracking-wide text-[#888]">Progress</div><div className="mt-3 space-y-1.5">{steps.map((st,i)=><div key={st} className="flex gap-2 items-center"><div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${i<=currentIdx?"bg-black text-white":"bg-[#F0F0F0] text-[#999]"}`}>{i+1}</div><span className={`text-[12px] ${form.status===st?"font-semibold":""}`}>{st}</span></div>)}</div><div className="flex gap-1 mt-3">{steps.map((s,i)=><div key={s} className={`flex-1 h-1.5 rounded-full ${i<=currentIdx?"bg-black":"bg-[#EAE6E1]"}`} />)}</div></div>
          <div className="mt-6 space-y-3">
            <div><label className="text-[11px] text-[#666]">Status</label><select value={form.status} onChange={e=>setForm({...form, status:e.target.value})} className="mt-1 w-full h-9 border rounded-full px-3 text-[12px] bg-white"><option>Booking Requested</option><option>Booking Confirmed</option><option>Loaded</option><option>In Transit</option><option>Arrived</option><option>Delivered</option></select></div>
            <div className="grid grid-cols-2 gap-2"><div><label className="text-[11px] text-[#666]">Booking #</label><input value={form.booking_number} onChange={e=>setForm({...form, booking_number:e.target.value})} placeholder="BK-..." className="mt-1 w-full h-8 border rounded-full px-3 text-[12px]" /></div><div><label className="text-[11px] text-[#666]">Container #</label><input value={form.container_number} onChange={e=>setForm({...form, container_number:e.target.value})} placeholder="MSCU..." className="mt-1 w-full h-8 border rounded-full px-3 text-[12px] font-mono" /></div></div>
            <div className="grid grid-cols-2 gap-2"><div><label className="text-[11px] text-[#666]">Size</label><select value={form.container_size} onChange={e=>setForm({...form, container_size:e.target.value})} className="mt-1 w-full h-8 border rounded-full px-2 text-[12px] bg-white"><option>20FT</option><option>40FT</option><option>LCL</option></select></div><div><label className="text-[11px] text-[#666]">Vessel</label><input value={form.vessel_name} onChange={e=>setForm({...form, vessel_name:e.target.value})} placeholder="Ever Given" className="mt-1 w-full h-8 border rounded-full px-3 text-[12px]" /></div></div>
            <div className="grid grid-cols-2 gap-2"><div><label className="text-[11px] text-[#666]">ETD</label><input type="date" value={form.etd} onChange={e=>setForm({...form, etd:e.target.value})} className="mt-1 w-full h-8 border rounded-full px-2 text-[12px]" /></div><div><label className="text-[11px] text-[#666]">ETA</label><input type="date" value={form.eta} onChange={e=>setForm({...form, eta:e.target.value})} className="mt-1 w-full h-8 border rounded-full px-2 text-[12px]" /></div></div>
            <button onClick={save} disabled={saving} className="w-full h-10 rounded-full bg-black text-white text-[13px] font-medium mt-2 disabled:opacity-50">{saving?"Saving...":"Save ✓"}</button>
            {errorMsg && <div className="text-[11px] text-red-600 bg-red-50 border border-red-200 p-2 rounded-full text-center">{errorMsg}</div>}
          </div>
          <div className="mt-6 border-t pt-4"><div className="text-[11px] font-medium uppercase text-[#888]">Raw Supabase Row</div><pre className="mt-2 text-[10px] bg-[#F9F9F7] border p-3 rounded-[12px] overflow-auto max-h-60">{JSON.stringify(selected, null, 2)}</pre><div className="text-[10px] text-[#999] mt-2">If save fails, tell me exact columns in this JSON and I will match them.</div></div>
        </div>)}
      </div>
    </div>
  </div></main>;
}
