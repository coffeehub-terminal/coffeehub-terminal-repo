"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
export default function LogisticsPage(){
  const [rows,setRows]=useState<any[]>([]); const [contracts,setContracts]=useState<any>({}); const [selected,setSelected]=useState<any>(null); const [form,setForm]=useState<any>({}); const [saving,setSaving]=useState(false);
  useEffect(()=>{(async()=>{
    const {data}=await supabase.from("Logistics").select("*").order("id",{ascending:false}).limit(100);
    if(data){ setRows(data); const cIds=[...new Set(data.map((r:any)=>r.contract_id).filter(Boolean))]; if(cIds.length){ const {data:cd}=await supabase.from("Contracts").select("*").in("id",cIds); const m:any={}; cd?.forEach((c:any)=>m[String(c.id)]=c); setContracts(m);} }
  })();},[]);
  const open=(l:any)=>{ setSelected(l); setForm({status:l.status||"Booking Requested",booking_number:l.booking_number||"",container_number:l.container_number||"",container_size:l.container_size||"20FT",shipping_line:l.shipping_line||"",vessel_name:l.vessel_name||l.vessel||"",vessel:l.vessel||l.vessel_name||"",voyage_number:l.voyage_number||l.voyage||"",voyage:l.voyage||l.voyage_number||"",bill_of_lading:l.bill_of_lading||l.bill_of_landing||"",bill_of_landing:l.bill_of_landing||l.bill_of_lading||"",departure_port:l.departure_port||"",arrival_port:l.arrival_port||"",etd:l.etd?String(l.etd).slice(0,10):"",eta:l.eta?String(l.eta).slice(0,10):"",freight_forwarder:l.freight_forwarder||"",notes:l.notes||"",bill_of_lading_url:l.bill_of_lading_url||"",commercial_invoice_url:l.commercial_invoice_url||"",packing_list_url:l.packing_list_url||""}); };
  const save=async()=>{
    if(!selected) return; setSaving(true);
    const payload:any={
      status:form.status,
      booking_number:form.booking_number||null,
      container_number:form.container_number||null,
      container_size:form.container_size||null,
      shipping_line:form.shipping_line||null,
      vessel_name:form.vessel_name||null,
      vessel:form.vessel||form.vessel_name||null,
      voyage_number:form.voyage_number||null,
      voyage:form.voyage||form.voyage_number||null,
      bill_of_lading:form.bill_of_lading||null,
      bill_of_landing:form.bill_of_landing||form.bill_of_lading||null,
      departure_port:form.departure_port||null,
      arrival_port:form.arrival_port||null,
      etd:form.etd||null,
      eta:form.eta||null,
      freight_forwarder:form.freight_forwarder||null,
      notes:form.notes||null,
      bill_of_lading_url:form.bill_of_lading_url||null,
      commercial_invoice_url:form.commercial_invoice_url||null,
      packing_list_url:form.packing_list_url||null
    };
    const {error}=await supabase.from("Logistics").update(payload).eq("id",selected.id);
    setSaving(false);
    if(error) return alert(error.message);
    setSelected(null);
    const {data}=await supabase.from("Logistics").select("*").order("id",{ascending:false}).limit(100);
    if(data) setRows(data);
  };
  const steps=["Booking Requested","Booking Confirmed","Loaded","In Transit","Arrived","Delivered"];
  const currentIdx=steps.indexOf(form.status||"Booking Requested");
  return <main className="min-h-screen bg-[#FBFBF9] p-6 max-w-[1280px] mx-auto"><div className="flex justify-between"><Link href="/" className="text-[12px] border bg-white px-3 py-1.5 rounded-full">← Seller OS</Link><h1 className="font-semibold">Logistics • {rows.length}</h1><Link href="/contracts" className="text-[12px] border bg-white px-3 py-1.5 rounded-full">Contracts →</Link></div>
  <div className="mt-6 grid md:grid-cols-5 gap-6">
  {/* FIX: overflow-hidden + rounded-t/b for black selected */}
  <div className="md:col-span-3 bg-white border rounded-[16px] divide-y overflow-hidden">
    {rows.map((l:any)=>{ const c=contracts[String(l.contract_id)]; const act=selected?.id===l.id; return <div key={String(l.id)} onClick={()=>open(l)} className={`p-4 cursor-pointer transition ${act?"bg-black text-white":"hover:bg-[#FAFAF8] text-black"}`}><div className="flex justify-between"><span className="text-[13px] font-medium">{String(l.id)} • {l.booking_number||"No booking"} • {c?.contract_number||`Contract ${l.contract_id}`}</span><span className={`text-[10px] px-2 py-1 rounded-full border shrink-0 ${act?"bg-white text-black border-white":"bg-amber-50 text-black"}`}>{l.status}</span></div><div className={`text-[11px] mt-1 flex gap-3 ${act?"text-white/60":"text-[#888]"}`}><span>{l.container_number||"-"} {l.container_size||""}</span><span>{l.vessel_name||l.vessel||"-"}</span><span>{l.eta||"-"}</span></div></div> })}
  </div>
  <div className="md:col-span-2 bg-white border rounded-[16px] p-5 h-fit sticky top-6 overflow-hidden">{!selected?<div className="text-[12px] text-[#999] text-center py-10">← Select shipment</div>:<div><div className="flex justify-between items-center"><h3 className="font-semibold text-[13px]">{String(selected.id)} • Contract {String(selected.contract_id)}</h3><button onClick={()=>setSelected(null)} className="w-7 h-7 rounded-full border flex items-center justify-center text-[12px]">x</button></div><div className="mt-4 space-y-1">{steps.map((st,i)=><div key={st} className="flex gap-2 items-center"><div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${i<=currentIdx?"bg-black text-white":"bg-[#F0F0F0]"}`}>{i+1}</div><span className={`text-[12px] ${i===currentIdx?"font-medium":""}`}>{st}</span></div>)}</div><div className="mt-6 space-y-2"><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="w-full h-9 border rounded-full px-3 text-[13px]"><option>Booking Requested</option><option>Booking Confirmed</option><option>Loaded</option><option>In Transit</option><option>Arrived</option><option>Delivered</option></select><div className="grid grid-cols-2 gap-2"><input value={form.booking_number} onChange={e=>setForm({...form,booking_number:e.target.value})} placeholder="Booking #" className="h-8 border rounded-full px-3 text-[12px]" /><input value={form.container_number} onChange={e=>setForm({...form,container_number:e.target.value})} placeholder="Container #" className="h-8 border rounded-full px-3 text-[12px]" /></div><div className="grid grid-cols-2 gap-2"><select value={form.container_size} onChange={e=>setForm({...form,container_size:e.target.value})} className="h-8 border rounded-full px-2 text-[12px]"><option>20FT</option><option>40FT</option><option>LCL</option></select><input value={form.shipping_line} onChange={e=>setForm({...form,shipping_line:e.target.value})} placeholder="Shipping line" className="h-8 border rounded-full px-3 text-[12px]" /></div><div className="grid grid-cols-2 gap-2"><input value={form.vessel_name} onChange={e=>setForm({...form,vessel_name:e.target.value})} placeholder="Vessel name" className="h-8 border rounded-full px-3 text-[12px]" /><input value={form.voyage_number} onChange={e=>setForm({...form,voyage_number:e.target.value})} placeholder="Voyage #" className="h-8 border rounded-full px-3 text-[12px]" /></div><div className="grid grid-cols-2 gap-2"><input value={form.departure_port} onChange={e=>setForm({...form,departure_port:e.target.value})} placeholder="Departure port" className="h-8 border rounded-full px-3 text-[12px]" /><input value={form.arrival_port} onChange={e=>setForm({...form,arrival_port:e.target.value})} placeholder="Arrival port" className="h-8 border rounded-full px-3 text-[12px]" /></div><div className="grid grid-cols-2 gap-2"><input type="date" value={form.etd} onChange={e=>setForm({...form,etd:e.target.value})} className="h-8 border rounded-full px-2 text-[12px]" /><input type="date" value={form.eta} onChange={e=>setForm({...form,eta:e.target.value})} className="h-8 border rounded-full px-2 text-[12px]" /></div><input value={form.freight_forwarder} onChange={e=>setForm({...form,freight_forwarder:e.target.value})} placeholder="Freight forwarder" className="w-full h-8 border rounded-full px-3 text-[12px]" /><input value={form.bill_of_lading} onChange={e=>setForm({...form,bill_of_lading:e.target.value})} placeholder="Bill of Lading #" className="w-full h-8 border rounded-full px-3 text-[12px]" /><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Notes" className="w-full h-16 border rounded-[12px] p-2 text-[12px]" /><button onClick={save} disabled={saving} className="w-full h-10 rounded-full bg-black text-white text-[13px]">{saving?"Saving...":"Save ✓"}</button></div></div>}</div></div></main>;
}
