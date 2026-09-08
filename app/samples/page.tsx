"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function SamplesPage(){
  const [samples,setSamples]=useState<any[]>([])
  const [reqs,setReqs]=useState<any[]>([])
  const [rooms,setRooms]=useState<any[]>([])
  const [offers,setOffers]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [toast,setToast]=useState("")
  const [editing,setEditing]=useState<string|null>(null)
  const [form,setForm]=useState<any>({})

  const load=async()=>{
    const [{data:s},{data:r},{data:rm},{data:off}]=await Promise.all([
      supabase.from("Samples").select("*").order("created_at",{ascending:false}).limit(100),
      supabase.from("SampleRequests").select("*").order("created_at",{ascending:false}).limit(100),
      supabase.from("Rooms").select("*").order("created_at",{ascending:false}).limit(100),
      supabase.from("Offers").select("*").order("created_at",{ascending:false}).limit(100)
    ])
    setSamples(s||[]); setReqs(r||[]); setRooms(rm||[]); setOffers(off||[]); setLoading(false)
  }
  useEffect(()=>{load()},[])

  const getRoom=(roomId:string)=> rooms.find(x=> x.id===roomId || x.share_token===roomId) || { name: roomId?.slice(0,8)||"Unknown", id:roomId, created_at:null, offer_ids:"" }
  const getProducts=(room:any)=>{
    const oIds=(room?.offer_ids||"").split(",").filter(Boolean)
    const prods=offers.filter(o=> oIds.includes(o.id) || oIds.includes(o.lot_number))
    return prods.length>0 ? prods.map(p=>`${p.lot_number} $${p.price_per_kg}/kg`).join(", ") : (room?.offer_ids||"")
  }

  const startEdit=(s:any)=>{
    setEditing(s.id)
    setForm({ status:s.status||"Preparing", courier:s.courier||"", tracking_number:s.tracking_number||"", notes:s.notes||"", shipped_at:s.shipped_at||"", delivered_at:s.delivered_at||"" })
  }
  const save=async(id:string)=>{
    const {error}=await supabase.from("Samples").update(form).eq("id", id)
    if(error) setToast(`❌ ${error.message}`); else { setToast(`✅ Sample ${id.slice(0,8)} saved - room ${getRoom(samples.find(x=>x.id===id)?.room_id).name} buyer sees live`); setEditing(null); load() }
    setTimeout(()=>setToast(""),3000)
  }

  if(loading) return <div className="min-h-screen flex items-center justify-center">Loading samples...</div>
  return (
    <div className="min-h-screen bg-[#fbfaf8] text-black">
      <header className="border-b bg-white sticky top-0 z-20"><div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-7 h-7 bg-black text-white rounded-md flex items-center justify-center text-[11px] font-bold">CH</div><span className="font-semibold">Samples OS • {samples.length} active</span><span className="text-xs text-neutral-500">Buyer clicks Request Sample → you fill this → buyer sees live • Room name + date + products in every card</span></div><div className="flex gap-2"><Link href="/" className="border border-black rounded-full px-3 py-1.5 text-xs">← Seller OS</Link><button onClick={load} className="bg-black text-white rounded-full px-3 py-1.5 text-xs">Refresh</button></div></div></header>
      <main className="max-w-[1600px] mx-auto px-6 py-6 grid grid-cols-[420px_1fr] gap-6">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-widest mb-3">Sample Requests (from buyer room)</div>
          <div className="grid gap-4">
            {reqs.map((r:any)=>{
              const room=getRoom(r.room_id)
              const products=getProducts(room)
              const dateLabel=r.created_at?new Date(r.created_at).toLocaleString():""
              const roomDate=room?.created_at?new Date(room.created_at).toLocaleDateString():""
              const linkedSamples=samples.filter(s=> s.sample_request_id===r.id || s.room_id===r.room_id)
              return (
                <div key={r.id} className="bg-white border border-black rounded-[16px] p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono bg-black text-white rounded-full px-2 py-0.5">{room.name}</span>
                        <span className="text-[11px] font-mono">{r.id.slice(0,8)} • Room {room.name} (ROOM-{String(room.id).slice(0,4).toUpperCase()}) • {dateLabel} • Room created {roomDate}</span>
                      </div>
                      <div className="text-[14px] font-semibold mt-2">{r.buyer_email} • {r.status} • Room {room.name}</div>
                      <div className="text-[11px] mt-1 text-neutral-600">Products in room {room.name}: {products}</div>
                      <div className="text-[11px] mt-1">Sample for {products||r.notes}</div>
                    </div>
                    <span className={`text-[11px] rounded-full px-2 py-1 ${r.status==="Shipped"?"bg-black text-white":"border border-black"}`}>{r.status}</span>
                  </div>
                  <div className="mt-3 border-t pt-3">
                    <div className="text-[11px]">Courier: {linkedSamples[0]?.courier||"-"} • Tracking: {linkedSamples[0]?.tracking_number||"-"} • Room {room.name}</div>
                    <Link href={`/r/${r.room_id}`} className="mt-2 inline-block border border-black rounded-full px-3 py-1 text-[11px]">Open buyer room {room.name} →</Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-widest mb-3">Fill-out forms (what buyer sees live) • Room name + products in every form</div>
          <div className="grid gap-4">
            {samples.map((s:any)=>{
              const room=getRoom(s.room_id)
              const products=getProducts(room)
              const req=reqs.find(r=> r.id===s.sample_request_id)
              const isEditing=editing===s.id
              return (
                <div key={s.id} className="bg-white border border-black rounded-[16px] p-5">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono bg-black text-white rounded-full px-2 py-0.5">{room.name}</span>
                        <span className="text-[11px] font-mono">{s.id.slice(0,8)} → Room {room.name} (ROOM-{String(room.id).slice(0,4).toUpperCase()}) • Request {req?.id.slice(0,8)} • Room created {room?.created_at?new Date(room.created_at).toLocaleDateString():""} • {s.created_at?new Date(s.created_at).toLocaleString():""}</span>
                      </div>
                      <div className="text-[13px] font-semibold mt-1">{s.buyer_email} • Linked to: {req?.id.slice(0,8)} • Room {room.name} • Products: {products}</div>
                    </div>
                    {!isEditing ? <button onClick={()=>startEdit(s)} className="h-8 px-4 rounded-full bg-black text-white text-[11px]">Fill form (Seller)</button> : <div className="flex gap-2"><button onClick={()=>setEditing(null)} className="h-8 px-3 rounded-full border border-black text-[11px]">Cancel</button><button onClick={()=>save(s.id)} className="h-8 px-3 rounded-full bg-black text-white text-[11px]">Save → {room.name} buyer live</button></div>}
                  </div>
                  {isEditing ? (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <label className="text-[11px]">STATUS<select value={form.status} onChange={e=>setForm({...form, status:e.target.value})} className="mt-1 w-full h-9 border border-black rounded-full px-3 text-[13px]"><option>Preparing</option><option>Shipped</option><option>Delivered</option></select></label>
                      <label className="text-[11px]">COURIER<input value={form.courier} onChange={e=>setForm({...form, courier:e.target.value})} placeholder="DHL" className="mt-1 w-full h-9 border border-black rounded-full px-3 text-[13px]" /></label>
                      <label className="text-[11px]">TRACKING<input value={form.tracking_number} onChange={e=>setForm({...form, tracking_number:e.target.value})} placeholder="123456" className="mt-1 w-full h-9 border border-black rounded-full px-3 text-[13px]" /></label>
                      <label className="col-span-3 text-[11px]">NOTES (buyer room {room.name} sees)<textarea value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} rows={2} className="mt-1 w-full border border-black rounded-[12px] p-3 text-[13px]" /></label>
                      <label className="text-[11px]">Shipped at<input type="datetime-local" value={form.shipped_at?form.shipped_at.slice(0,16):""} onChange={e=>setForm({...form, shipped_at:e.target.value})} className="mt-1 w-full h-9 border border-black rounded-full px-3 text-[13px]" /></label>
                      <label className="text-[11px] col-span-2">Delivered at<input type="datetime-local" value={form.delivered_at?form.delivered_at.slice(0,16):""} onChange={e=>setForm({...form, delivered_at:e.target.value})} className="mt-1 w-full h-9 border border-black rounded-full px-3 text-[13px]" /></label>
                    </div>
                  ) : (
                    <>
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="border rounded-[12px] p-3"><div className="text-[10px] uppercase text-neutral-500">STATUS • Room {room.name}</div><div className="text-[13px] font-medium mt-1">{s.status}</div></div>
                        <div className="border rounded-[12px] p-3"><div className="text-[10px] uppercase text-neutral-500">COURIER • {products}</div><div className="text-[13px] font-medium mt-1">{s.courier||"-"}</div></div>
                        <div className="border rounded-[12px] p-3"><div className="text-[10px] uppercase text-neutral-500">TRACKING • Room {room.name}</div><div className="text-[13px] font-medium mt-1">{s.tracking_number||"-"}</div></div>
                        <div className="col-span-3 border rounded-[12px] p-3 bg-[#f0fdf4]"><div className="text-[10px] uppercase text-neutral-500">NOTES (BUYER SEES) • Room {room.name} • {products}</div><div className="text-[13px] mt-1">{s.notes||"-"}</div></div>
                      </div>
                      <div className="mt-2 text-[11px] text-neutral-500">Shipped: {s.shipped_at?new Date(s.shipped_at).toLocaleString():"-"} • Delivered: {s.delivered_at?new Date(s.delivered_at).toLocaleString():"-"} • Room {room.name} • Products {products}</div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white rounded-full px-4 py-2 text-sm">{toast}</div>}
    </div>
  )
}
