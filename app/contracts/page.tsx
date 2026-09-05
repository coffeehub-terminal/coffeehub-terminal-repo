"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
export default function ContractsPage(){
  const [list,setList]=useState<any[]>([]); const [sel,setSel]=useState<any>(null)
  const [form,setForm]=useState({status:"Draft",incoterm:"FOB",shipment_window:"30 DAYS",payment_terms:"100%",special_conditions:"",price:""})
  useEffect(()=>{(async()=>{ const {data}=await supabase.from("Contracts").select("*").order("created_at",{ascending:false}).limit(100); setList(data||[]) })()},[])
  const save=async()=>{
    if(!sel) return
    await supabase.from("Contracts").update(form).eq("id",sel.id)
    const {data}=await supabase.from("Contracts").select("*").order("created_at",{ascending:false}).limit(100); setList(data||[])
    alert(`Contract ${sel.contract_number} saved to ${form.status} - buyer in ${sel.room_id} sees it instantly`)
  }
  return (
    <div className="min-h-screen bg-white"><div className="border-b px-6 h- flex items-center justify-between"><Link href="/" className="px-4 py-1.5 rounded-full border text-sm">← Seller OS</Link><span className="font-semibold">Contracts • {list.length}</span><Link href="/logistics" className="px-4 py-1.5 rounded-full border text-sm">Logistics →</Link></div>
      <div className="grid grid-cols-2 h-[calc(100vh-56px)]">
        <div className="border-r overflow-auto">{list.map((c:any)=>(
          <div key={String(c.id)} onClick={()=>{setSel(c); setForm({status:c.status||"Draft",incoterm:c.incoterm||"FOB",shipment_window:c.shipment_window||"30 DAYS",payment_terms:c.payment_terms||"100%",special_conditions:c.special_conditions||"",price:c.price||""})}} className={`px-6 py-4 border-b cursor-pointer transition-all ${sel?.id===c.id? "bg-black text-white" : "hover:bg-[#fbfaf8] active:bg-black active:text-white"}`}>
            <div className="text-sm">{c.buyer_email} • {c.room_id} • {c.contract_number}</div>
            <div className="text-xs mt-1 opacity-70">PO {String(c.purchase_order_id).slice(0,8)} • FOB • ${c.price} • {c.status}</div>
          </div>
        ))}</div>
        <div className="p-6 overflow-auto">
          {sel? (
            <div className="border rounded-2xl p-5 space-y-3">
              <div><h3 className="font-semibold">{sel.contract_number} • {sel.buyer_email}</h3><p className="text-xs text-neutral-400">{sel.room_id} • PO {String(sel.purchase_order_id).slice(0,8)}</p></div>
              <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="w-full border rounded-full px-4 py-2.5 text-sm"><option>Draft</option><option>Sent</option><option>Signed</option></select>
              <div className="grid grid-cols-2 gap-3"><input placeholder="Incoterm - FOB" value={form.incoterm} onChange={e=>setForm({...form,incoterm:e.target.value})} className="border rounded-full px-4 py-2.5 text-sm"/><input placeholder="Shipment - 30 DAYS" value={form.shipment_window} onChange={e=>setForm({...form,shipment_window:e.target.value})} className="border rounded-full px-4 py-2.5 text-sm"/></div>
              <input placeholder="Payment - 100%" value={form.payment_terms} onChange={e=>setForm({...form,payment_terms:e.target.value})} className="w-full border rounded-full px-4 py-2.5 text-sm"/>
              <input placeholder="Price" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} className="w-full border rounded-full px-4 py-2.5 text-sm"/>
              <textarea placeholder="Special conditions" value={form.special_conditions} onChange={e=>setForm({...form,special_conditions:e.target.value})} className="w-full border rounded-2xl px-4 py-3 text-sm h-24"/>
              <button onClick={save} className="w-full py-3 rounded-full bg-black text-white text-sm font-medium hover:bg-neutral-800 active:scale-[0.98]">Save - buyer sees View Contract update</button>
              <button onClick={async()=>{ const {data}=await supabase.from("Logistics").insert({contract_id:sel.id, room_id:sel.room_id, buyer_email:sel.buyer_email, status:"Booked", booking_number:`BK-${Date.now()}`}).select().single(); alert(`Logistics ${data.booking_number} created for ${sel.room_id}`) }} className="w-full py-3 rounded-full border text-sm hover:bg-black hover:text-white transition-all">Create Logistics →</button>
            </div>
          ) : <div className="text-sm text-neutral-400 p-6 border rounded-2xl border-dashed text-center">← Select contract - black = selected</div>}
        </div>
      </div>
    </div>
  )
}
