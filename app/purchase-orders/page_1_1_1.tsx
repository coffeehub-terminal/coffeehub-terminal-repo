"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
export default function POsPage(){
  const [rows,setRows]=useState<any[]>([]); const [offers,setOffers]=useState<any>({}); const [rooms,setRooms]=useState<any>({});
  const [selected,setSelected]=useState<any>(null); const [status,setStatus]=useState("Pending"); const [saving,setSaving]=useState(false);
  useEffect(()=>{(async()=>{
    const {data}=await supabase.from("PurchaseOrders").select("*").order("created_at",{ascending:false}).limit(100);
    if(data){ setRows(data);
      const offerIds=[...new Set(data.map((r:any)=>r.offer_id).filter(Boolean))];
      const roomIds=[...new Set(data.map((r:any)=>r.room_id).filter(Boolean))];
      if(offerIds.length){ const {data:od}=await supabase.from("Offers").select("*").in("id",offerIds); const m:any={}; od?.forEach((o:any)=>m[o.id]=o); setOffers(m); }
      if(roomIds.length){ const {data:rd}=await supabase.from("Rooms").select("*").in("id",roomIds); const m:any={}; rd?.forEach((r:any)=>m[r.id]=r); setRooms(m); }
    }
  })();},[]);
  const open=(po:any)=>{ setSelected(po); setStatus(po.status||"Pending"); };
  const save=async()=>{ if(!selected) return; setSaving(true); const {error}=await supabase.from("PurchaseOrders").update({status}).eq("id",selected.id); setSaving(false); if(error) return alert(error.message); setSelected(null); const {data}=await supabase.from("PurchaseOrders").select("*").order("created_at",{ascending:false}).limit(100); if(data) setRows(data); };
  const createContract=async()=>{
    if(!selected) return;
    // Contracts: id bigint auto, purchase_order_id text NO, room_id text NO, buyer_email, status, contract_number, price
    const contract_number=`CTR-${Date.now().toString().slice(-6)}`;
    const {data,error}=await supabase.from("Contracts").insert({purchase_order_id:String(selected.id),room_id:String(selected.room_id),buyer_email:selected.buyer_email||null,status:"Draft",contract_number,price:selected.price||null}).select().single();
    if(error) return alert("Contracts: "+error.message);
    alert(`Contract ${contract_number} created!`);
    window.location.href="/contracts";
  };
  return <main className="min-h-screen bg-[#FBFBF9] p-6 max-w-[1080px] mx-auto"><div className="flex justify-between"><Link href="/" className="text-[12px] border bg-white px-3 py-1.5 rounded-full">← Seller OS</Link><h1 className="font-semibold">Purchase Orders • {rows.length}</h1><Link href="/contracts" className="text-[12px] border bg-white px-3 py-1.5 rounded-full">Contracts →</Link></div>
  <div className="mt-6 grid md:grid-cols-3 gap-6"><div className="md:col-span-2 bg-white border rounded-[16px] divide-y overflow-hidden">
    {rows.map((po:any)=>{ const o=offers[po.offer_id]; const r=rooms[po.room_id]; return <div key={String(po.id)} onClick={()=>open(po)} className={`p-4 cursor-pointer transition ${selected?.id===po.id?"bg-black text-white":""}`}><div className="flex justify-between"><span className="text-[13px] font-medium">{String(po.id).slice(0,8)} • {po.buyer_email||"-"} • {o?.lot_number||po.offer_id||"-"}</span><span className={`text-[10px] px-2 py-1 rounded-full ${selected?.id===po.id?"bg-white text-black":"bg-amber-50 border"}`}>{po.status}</span></div><div className={`text-[11px] mt-1 ${selected?.id===po.id?"text-white/60":"text-[#888]"}`}>Room {r?.name||po.room_id} • Qty {po.quantity||"?"} • ${po.price||"-"} • {new Date(po.created_at).toLocaleDateString()}</div></div>})}
  </div>
  <div className="bg-white border rounded-[16px] p-5 h-fit sticky top-6">{!selected?<div className="text-[12px] text-[#999] text-center py-10">← Select PO</div>:<div><h3 className="font-semibold text-[14px]">{String(selected.id).slice(0,8)}</h3><div className="mt-4 space-y-3"><div className="text-[11px] text-[#888]">Offer: {offers[selected.offer_id]?.lot_number||selected.offer_id}</div><select value={status} onChange={e=>setStatus(e.target.value)} className="w-full h-9 border rounded-full px-3 text-[13px]"><option>Pending</option><option>Requested</option><option>Accepted</option><option>Rejected</option><option>Contracted</option></select><button onClick={save} disabled={saving} className="w-full h-10 rounded-full bg-black text-white text-[13px]">{saving?"Saving...":"Save status"}</button><button onClick={createContract} className="w-full h-10 rounded-full border text-[13px]">Create Contract →</button><pre className="text-[10px] bg-[#F9F9F7] p-2 rounded-[8px] overflow-auto max-h-40">{JSON.stringify(selected,null,2)}</pre></div></div>}</div></div></main>;
}
