"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
export default function POPage(){
  const [pos,setPos]=useState<any[]>([]); const [sel,setSel]=useState<any>(null); const [form,setForm]=useState({status:"Pending",quantity:"1",price:""})
  useEffect(()=>{(async()=>{ const {data}=await supabase.from("PurchaseOrders").select("*").order("created_at",{ascending:false}).limit(100); setPos(data||[]) })()},[])
  const save=async()=>{ if(!sel) return; await supabase.from("PurchaseOrders").update(form).eq("id",sel.id); const {data}=await supabase.from("PurchaseOrders").select("*").order("created_at",{ascending:false}).limit(100); setPos(data||[]); alert(`PO ${String(sel.id).slice(0,8)} → ${form.status} - buyer in ${sel.room_id} sees +1`) }
  return (
    <div className="min-h-screen bg-white"><div className="border-b px-6 h- flex items-center justify-between"><Link href="/" className="px-4 py-1.5 rounded-full border text-sm">← Seller OS</Link><span className="font-semibold">Purchase Orders • {pos.length} {pos.filter(p=>p.status==="Pending").length>0 && <span className="ml-2 px-2 py-0.5 bg-green-500 text-white rounded-full text-xs">+{pos.filter(p=>p.status==="Pending").length} pending</span>}</span><Link href="/contracts" className="px-4 py-1.5 rounded-full border text-sm">Contracts →</Link></div>
      <div className="grid grid-cols-2 h-[calc(100vh-56px)]">
        <div className="border-r overflow-auto">{pos.map((p:any)=>(<div key={String(p.id)} onClick={()=>{setSel(p); setForm({status:p.status||"Pending",quantity:String(p.quantity||"1"),price:String(p.price||"")})}} className={`px-6 py-4 border-b cursor-pointer transition-all ${sel?.id===p.id? "bg-black text-white" : "hover:bg-[#fbfaf8] active:bg-black active:text-white"}`}><div className="text-sm">{p.buyer_email} • {p.room_id} • {String(p.offer_id).slice(0,12)} • Qty {p.quantity}</div><div className="text-xs mt-1 opacity-70">{p.room_id} • ${p.price} • {new Date(p.created_at).toLocaleDateString()} • {p.status}</div></div>))}</div>
        <div className="p-6">
          {sel? <div className="border rounded-2xl p-5 space-y-3"><h3 className="font-semibold">{sel.buyer_email} • {sel.room_id}</h3><p className="text-xs text-neutral-400">Offer: {sel.offer_id} • Room: {sel.room_id} • {sel.room_id}</p>
            <div className="grid grid-cols-2 gap-3"><input type="number" placeholder="Quantity" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} className="border rounded-full px-4 py-2.5 text-sm"/><input placeholder="Price" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} className="border rounded-full px-4 py-2.5 text-sm"/></div>
            <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="w-full border rounded-full px-4 py-2.5 text-sm"><option>Pending</option><option>Accepted</option><option>Rejected</option></select>
            <button onClick={save} className="w-full py-3 rounded-full bg-black text-white text-sm font-medium hover:bg-neutral-800 active:scale-[0.98]">Save status - buyer sees +1</button>
            <button onClick={async()=>{ const {data}=await supabase.from("Contracts").insert({purchase_order_id:sel.id, room_id:sel.room_id, buyer_email:sel.buyer_email, status:"Draft", contract_number:`CT-${String(sel.id).slice(0,8).toUpperCase()}`, price:sel.price}).select().single(); alert(`Contract ${data.contract_number} created for ${sel.room_id}`) }} className="w-full py-3 rounded-full border text-sm hover:bg-black hover:text-white transition-all">Create Contract →</button>
          </div> : <div className="text-sm text-neutral-400 p-6 border rounded-2xl border-dashed text-center">← Select PO - black = selected, reactive</div>}
        </div>
      </div>
    </div>
  )
}
