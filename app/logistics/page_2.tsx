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
  const load = async()=>{
    const {data} = await supabase.from("Logistics").select("*").order("created_at",{ascending:false}).limit(100);
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
    setForm({
      status: l.status||"Booking Requested",
      booking_number: l.booking_number||"",
      container_number: l.container_number||"",
      container_size: l.container_size||"20FT",
      vessel_name: l.vessel_name||"",
      eta: l.eta ? new Date(l.eta).toISOString().slice(0,10) : "",
      etd: l.etd ? new Date(l.etd).toISOString().slice(0,10) : "",
      seal_number: l.seal_number||"",
      port_loading: l.port_loading||"Buenaventura",
      port_discharge: l.port_discharge||"",
    });
  };
  const save = async()=>{
    if(!selected) return; setSaving(true);
    try{
      const payload:any = { status: form.status, booking_number: form.booking_number||null, container_number: form.container_number||null, container_size: form.container_size||null, vessel_name: form.vessel_name||null, seal_number: form.seal_number||null, port_loading: form.port_loading||null, port_discharge: form.port_discharge||null, };
      if(form.eta) payload.eta = new Date(form.eta).toISOString();
      if(form.etd) payload.etd = new Date(form.etd).toISOString();
      const { error } = await supabase.from("Logistics").update(payload).eq("id", selected.id);
      if(error) throw error;
      setSelected(null); load();
    }catch(e:any){ alert(e.message); } finally{ setSaving(false); }
  };
  const steps = ["Booking Requested","Booking Confirmed","Loaded","In Transit","Arrived"];
  const currentIdx = steps.indexOf(form.status||selected?.status||"Booking Requested");
  return <main className="min-h-screen bg-[#FBFBF9] text-[#111]"><div className="max-w-[1280px] mx-auto p-6"><div className="flex justify-between items-center"><Link href="/" className="text-[12px] border bg-white px-3 py-1.5 rounded-full">← Seller OS</Link><h1 className="text-[16px] font-semibold">Logistics • {rows.length}</h1><Link href="/contracts" className="text-[12px] border bg-white px-3 py-1.5 rounded-full">← Contracts</Link></div>
  <div className="mt-6 grid md:grid-cols-3 gap-6">
    <div className="md:col-span-2 bg-white border rounded-[16px] divide-y">
      {rows.map((l:any)=>{
        const contract = contracts[String(l.contract_id||"")];
        const isActive = selected?.id===l.id;
        return <div key={String(l.id)} onClick={()=>open(l)} className={`p-4 cursor-pointer hover:bg-[#FAFAF8] ${isActive?"bg-[#111] text-white":""}`}>
          <div className="flex justify-between"><div className={`text-[13px] font-medium ${isActive?"text-white":""}`}>{String(l.id).slice(0,12)} • {String(l.booking_number||"-")} • {contract?.contract_number||String(l.contract_id||"").slice(0,8)||"-"}</div><span className={`text-[10px] px-2 py-1 rounded-full border h-fit ${isActive?"bg-white text-black":"bg-gray-50"}`}>{l.status}</span></div>
          <div className={`text-[11px] mt-1 ${isActive?"text-white/60":"text-[#888]"}`}>Container: {String(l.container_number||"-")} • Vessel: {String(l.vessel_name||"-")} • ETA: {l.eta?new Date(l.eta).toLocaleDateString():"-"}</div>
        </div>
      })}
      {rows.length===0&&<div className="p-12 text-center text-[12px] text-[#999]">No logistics — create from /contracts</div>}
    </div>
    <div className="bg-white border rounded-[16px] p-5 h-fit sticky top-6">
      {!selected ? <div className="text-[12px] text-[#999] text-center py-10">← Select shipment</div> : (<div><div className="flex justify-between"><h3 className="font-semibold text-[14px]">{String(selected.id)}</h3><button onClick={()=>setSelected(null)} className="text-[11px] border px-2 py-1 rounded-full">x</button></div>
        <div className="mt-5"><div className="text-[11px] uppercase text-[#888]">Progress</div><div className="mt-3 space-y-2">{steps.map((st,i)=><div key={st} className="flex gap-2 items-center"><div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${i<=currentIdx?"bg-black text-white":"bg-[#F0F0F0]"}`}>{i+1}</div><span className="text-[12px]">{st}</span></div>)}</div><div className="flex gap-1 mt-3">{steps.map((s,i)=><div key={s} className={`flex-1 h-1.5 rounded-full ${i<=currentIdx?"bg-black":"bg-[#EAE6E1]"}`} />)}</div></div>
        <div className="mt-6 grid grid-cols-2 gap-2"><div className="col-span-2"><select value={form.status} onChange={e=>setForm({...form, status:e.target.value})} className="w-full h-9 border rounded-full px-3 text-[12px]"><option>Booking Requested</option><option>Booking Confirmed</option><option>Loaded</option><option>In Transit</option><option>Arrived</option></select></div><div><input value={form.booking_number} onChange={e=>setForm({...form, booking_number:e.target.value})} placeholder="Booking #" className="w-full h-8 border rounded-full px-3 text-[12px]" /></div><div><input value={form.container_number} onChange={e=>setForm({...form, container_number:e.target.value})} placeholder="Container #" className="w-full h-8 border rounded-full px-3 text-[12px]" /></div><div className="col-span-2"><input value={form.vessel_name} onChange={e=>setForm({...form, vessel_name:e.target.value})} placeholder="Vessel" className="w-full h-9 border rounded-full px-3 text-[12px]" /></div><div><input type="date" value={form.etd} onChange={e=>setForm({...form, etd:e.target.value})} className="w-full h-8 border rounded-full px-2 text-[12px]" /></div><div><input type="date" value={form.eta} onChange={e=>setForm({...form, eta:e.target.value})} className="w-full h-8 border rounded-full px-2 text-[12px]" /></div></div><button onClick={save} disabled={saving} className="w-full h-10 rounded-full bg-black text-white text-[13px] mt-5">{saving?"...":"Save"}</button></div>)}
    </div>
  </div></div></main>;
}
