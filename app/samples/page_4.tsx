"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
export default function SamplesPage(){
  const [rows,setRows]=useState<any[]>([]); const [selected,setSelected]=useState<any>(null); const [form,setForm]=useState<any>({}); const [saving,setSaving]=useState(false);
  useEffect(()=>{(async()=>{
    let {data,error}=await supabase.from("Samples").select("*").order("created_at",{ascending:false}).limit(100);
    if(error || !data || data.length===0){
      const {data:d2}=await supabase.from("SampleRequests").select("*").order("created_at",{ascending:false}).limit(100);
      if(d2) data=d2;
    }
    if(data) setRows(data);
  })();},[]);
  const open=(s:any)=>{ setSelected(s); setForm({status:s.status||"Requested",courier:s.courier||"",tracking_number:s.tracking_number||s.tracking||""}); };
  const save=async()=>{
    if(!selected) return; setSaving(true);
    let {error}=await supabase.from("Samples").update({status:form.status,courier:form.courier,tracking_number:form.tracking_number}).eq("id",selected.id);
    if(error){ const {error:e2}=await supabase.from("SampleRequests").update({status:form.status}).eq("id",selected.id); error=e2; }
    setSaving(false); if(error) return alert(error.message); setSelected(null); 
    const {data}=await supabase.from("Samples").select("*").order("created_at",{ascending:false}).limit(100); 
    if(data) setRows(data);
  };
  return <main className="min-h-screen bg-[#FBFBF9] p-6 max-w-[1080px] mx-auto"><div className="flex justify-between"><Link href="/" className="text-[12px] border bg-white px-3 py-1.5 rounded-full">← Seller OS</Link><h1 className="font-semibold">Samples • {rows.length}</h1></div>
  <div className="mt-6 grid md:grid-cols-3 gap-6">
  <div className="md:col-span-2 bg-white border rounded-[16px] divide-y overflow-hidden">
    {rows.map((s:any)=>{
      const isSel=selected?.id===s.id;
      return <div key={String(s.id)} onClick={()=>open(s)} className={`p-4 cursor-pointer transition ${isSel?"bg-black text-white":"hover:bg-[#FAFAF8] text-black"}`}>
        <div className="flex justify-between items-center"><span className="text-[13px] font-medium truncate">{String(s.id).slice(0,8)} • {s.room_id||s.offer_id||""} • {s.buyer_email||""}</span><span className={`text-[10px] px-2 py-1 rounded-full border shrink-0 ${isSel?"bg-white text-black border-white":"bg-[#FFFEF3] text-black"}`}>{s.status}</span></div>
        <div className={`text-[11px] mt-1 ${isSel?"text-white/70":"text-[#888]"}`}>{s.courier||"-"} {s.tracking_number||""} • {s.created_at?new Date(s.created_at).toLocaleDateString():""}</div>
      </div>
    })}
  </div>
  <div className="bg-white border rounded-[16px] p-5 h-fit sticky top-6">{!selected?<div className="text-[12px] text-[#999] text-center py-10">← Select sample</div>:<div><h3 className="font-semibold text-[14px]">{String(selected.id).slice(0,8)}</h3><div className="mt-4 space-y-3"><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="w-full h-9 border rounded-full px-3 text-[13px]"><option>Requested</option><option>Preparing</option><option>Shipped</option><option>Delivered</option></select><input value={form.courier} onChange={e=>setForm({...form,courier:e.target.value})} placeholder="Courier" className="w-full h-9 border rounded-full px-3 text-[13px]" /><input value={form.tracking_number} onChange={e=>setForm({...form,tracking_number:e.target.value})} placeholder="Tracking #" className="w-full h-9 border rounded-full px-3 text-[13px]" /><button onClick={save} disabled={saving} className="w-full h-10 rounded-full bg-black text-white text-[13px]">{saving?"Saving...":"Save"}</button></div></div>}</div></div></main>;
}
