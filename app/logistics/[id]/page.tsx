"use client"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function LogisticsDetailOrganized(){
  const params = useParams()
  const id = (params as any)?.id as string
  const [l,setL]=useState<any>(null)
  const [room,setRoom]=useState<any>(null)
  const [offers,setOffers]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [editing,setEditing]=useState(false)
  const [form,setForm]=useState<any>({})
  const [toast,setToast]=useState("")

  const load = async()=>{
    setLoading(true)
    let found:any=null
    try{
      const num=parseInt(id)
      if(!isNaN(num)){ const {data}=await supabase.from("Logistics").select("*").eq("id", num).maybeSingle(); if(data) found=data }
    }catch{}
    if(!found){ try{ const {data}=await supabase.from("Logistics").select("*").eq("booking_number", id).maybeSingle(); if(data) found=data }catch{} }
    if(!found) found={ id, booking_number:id, status:"Booked" }
    setL(found)

    if(found?.room_id){
      const {data: r}=await supabase.from("Rooms").select("*").eq("id", found.room_id).maybeSingle()
      if(r){ setRoom(r); const oIds=(r.offer_ids||"").split(",").filter(Boolean); if(oIds.length>0){ const {data: off}=await supabase.from("Offers").select("*").in("id", oIds); setOffers(off||[]) } }
    }
    setForm({
      booking_number: found.booking_number||id,
      status: found.status||"Booked",
      container_number: found.container_number||"",
      container_size: found.container_size||"40FT",
      shipping_line: found.shipping_line||"",
      vessel_name: found.vessel_name||found.vessel||"",
      voyage_number: found.voyage_number||found.voyage||"",
      bill_of_lading: found.bill_of_lading||found.bill_of_landing||"",
      departure_port: found.departure_port||"Buenaventura",
      arrival_port: found.arrival_port||"Rotterdam",
      etd: found.etd||"",
      eta: found.eta||"",
      freight_forwarder: found.freight_forwarder||"",
      notes: found.notes||"",
    })
    setLoading(false)
  }
  useEffect(()=>{ load() },[id])

  const save = async()=>{
    try{
      setToast("Saving...")
      const payload={
        booking_number: form.booking_number,
        status: form.status,
        container_number: form.container_number,
        container_size: form.container_size,
        shipping_line: form.shipping_line,
        vessel_name: form.vessel_name,
        vessel: form.vessel_name,
        voyage_number: form.voyage_number,
        voyage: form.voyage_number,
        bill_of_lading: form.bill_of_lading,
        bill_of_landing: form.bill_of_lading,
        departure_port: form.departure_port,
        arrival_port: form.arrival_port,
        etd: form.etd||null,
        eta: form.eta||null,
        freight_forwarder: form.freight_forwarder,
        notes: form.notes,
      }
      const num=parseInt(id)
      if(!isNaN(num)){ await supabase.from("Logistics").update(payload).eq("id", num) }
      else { await supabase.from("Logistics").update(payload).eq("booking_number", id) }
      setToast("✅ Saved - Room "+(room?.name||l.room_id)+" buyer sees live")
      setEditing(false)
      load()
      setTimeout(()=>setToast(""),3000)
    }catch(e:any){ setToast("❌ "+e.message) }
  }

  if(loading) return <div className="min-h-screen flex items-center justify-center">Loading {id}...</div>

  const roomLabel = room ? `${room.name} • ROOM-${String(room.id).slice(0,4)} • Created ${new Date(room.created_at).toLocaleDateString()}` : `Room ${l.room_id?.slice(0,8)}`
  const productsLabel = offers.map(o=>`${o.lot_number} $${o.price_per_kg}/kg`).join(", ") || "Products: check room"

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b bg-white sticky top-0 z-20">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold">CH</span>
            <span className="font-semibold">{form.booking_number} • {form.status} • Room {room?.name||l.room_id?.slice(0,8)} • {new Date(room?.created_at||Date.now()).toLocaleDateString()}</span>
            <span className="text-[10px] bg-[#ea580c] text-white rounded-full px-2 py-0.5">LOGISTICS</span>
          </div>
          <div className="flex gap-2">
            {l.room_id && <Link href={`/r/${l.room_id}`} className="border border-black rounded-full px-3 py-1.5 text-xs">Buyer room {room?.name} →</Link>}
            <Link href="/logistics" className="border border-black rounded-full px-3 py-1.5 text-xs">← Logistics OS</Link>
            {!editing ? <button onClick={()=>setEditing(true)} className="bg-black text-white rounded-full px-4 py-1.5 text-xs">Edit (Seller)</button> : <><button onClick={()=>setEditing(false)} className="border border-black rounded-full px-3 py-1.5 text-xs">Cancel</button><button onClick={save} className="bg-[#ea580c] text-white rounded-full px-4 py-1.5 text-xs">Save → buyer sees live</button></>}
          </div>
        </div>
      </header>
      <main className="max-w-[1400px] mx-auto px-6 py-6">
        {toast && <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-black text-white rounded-full px-4 py-2 text-sm z-50">{toast}</div>}
        <div className="bg-black text-white rounded-[16px] p-4 mb-4 flex justify-between">
          <div><div className="text-[11px] opacity-70">ROOM</div><div className="font-bold">{roomLabel}</div><div className="text-[11px] opacity-80 mt-1">Products: {productsLabel}</div></div>
          <div className="text-right"><div className="text-[11px] opacity-70">BOOKING</div><div className="font-semibold">{form.booking_number}</div><div className="text-[11px] mt-1 bg-[#ea580c] rounded-full px-2 py-0.5">{form.status}</div></div>
        </div>
        {!editing ? (
          <div className="border border-black rounded-[16px] overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-y divide-black">
              <div className="p-4"><div className="text-[10px] uppercase text-neutral-500">CONTAINER • Room {room?.name}</div><div className="font-medium mt-1">{form.container_number||"-"} • {form.container_size}</div></div>
              <div className="p-4"><div className="text-[10px] uppercase text-neutral-500">VESSEL • {productsLabel}</div><div className="font-medium mt-1">{form.vessel_name||"-"} {form.voyage_number?`• ${form.voyage_number}`:""}</div></div>
              <div className="p-4"><div className="text-[10px] uppercase text-neutral-500">SHIPPING LINE</div><div className="font-medium mt-1">{form.shipping_line||"-"}</div></div>
              <div className="p-4"><div className="text-[10px] uppercase text-neutral-500">B/L • Room {room?.name} • {new Date(room?.created_at||Date.now()).toLocaleDateString()}</div><div className="font-medium mt-1">{form.bill_of_lading||"-"}</div></div>
              <div className="p-4"><div className="text-[10px] uppercase text-neutral-500">DEPARTURE → ARRIVAL</div><div className="font-medium mt-1">{form.departure_port} → {form.arrival_port}</div></div>
              <div className="p-4"><div className="text-[10px] uppercase text-neutral-500">FREIGHT FORWARDER</div><div className="font-medium mt-1">{form.freight_forwarder||"-"}</div></div>
              <div className="p-4"><div className="text-[10px] uppercase text-neutral-500">ETD • Room {room?.name}</div><div className="font-medium mt-1">{form.etd?new Date(form.etd).toLocaleDateString():"-"}</div></div>
              <div className="p-4"><div className="text-[10px] uppercase text-neutral-500">ETA • Products {productsLabel}</div><div className="font-medium mt-1">{form.eta?new Date(form.eta).toLocaleDateString():"-"}</div></div>
              <div className="col-span-2 p-4 bg-[#fff7ed]"><div className="text-[10px] uppercase text-neutral-500">NOTES - Buyer sees what you save • Room {room?.name} • {productsLabel}</div><div className="mt-1 text-[13px]">{form.notes||"-"}</div></div>
            </div>
          </div>
        ) : (
          <div className="border border-black rounded-[16px] p-6 grid grid-cols-2 gap-4 bg-[#fff7ed]">
            <label className="text-[11px]">BOOKING - Room {room?.name}<input value={form.booking_number} onChange={e=>setForm({...form, booking_number:e.target.value})} className="mt-1 w-full h-9 border border-black rounded-full px-3 text-[13px]" /></label>
            <label className="text-[11px]">STATUS<select value={form.status} onChange={e=>setForm({...form, status:e.target.value})} className="mt-1 w-full h-9 border border-black rounded-full px-3 text-[13px]"><option>Booked</option><option>In Transit</option><option>Delivered</option></select></label>
            <label className="text-[11px]">CONTAINER<input value={form.container_number} onChange={e=>setForm({...form, container_number:e.target.value})} placeholder="MSCU1234567" className="mt-1 w-full h-9 border border-black rounded-full px-3 text-[13px]" /></label>
            <label className="text-[11px]">SIZE<select value={form.container_size} onChange={e=>setForm({...form, container_size:e.target.value})} className="mt-1 w-full h-9 border border-black rounded-full px-3 text-[13px]"><option>20FT</option><option>40FT</option><option>40FT HC</option></select></label>
            <label className="text-[11px]">VESSEL<input value={form.vessel_name} onChange={e=>setForm({...form, vessel_name:e.target.value})} placeholder="MSC LEO" className="mt-1 w-full h-9 border border-black rounded-full px-3 text-[13px]" /></label>
            <label className="text-[11px]">VOYAGE<input value={form.voyage_number} onChange={e=>setForm({...form, voyage_number:e.target.value})} placeholder="123W" className="mt-1 w-full h-9 border border-black rounded-full px-3 text-[13px]" /></label>
            <label className="text-[11px]">SHIPPING LINE<input value={form.shipping_line} onChange={e=>setForm({...form, shipping_line:e.target.value})} placeholder="Maersk" className="mt-1 w-full h-9 border border-black rounded-full px-3 text-[13px]" /></label>
            <label className="text-[11px]">B/L<input value={form.bill_of_lading} onChange={e=>setForm({...form, bill_of_lading:e.target.value})} placeholder="BL123456" className="mt-1 w-full h-9 border border-black rounded-full px-3 text-[13px]" /></label>
            <label className="text-[11px]">DEPARTURE<input value={form.departure_port} onChange={e=>setForm({...form, departure_port:e.target.value})} className="mt-1 w-full h-9 border border-black rounded-full px-3 text-[13px]" /></label>
            <label className="text-[11px]">ARRIVAL<input value={form.arrival_port} onChange={e=>setForm({...form, arrival_port:e.target.value})} className="mt-1 w-full h-9 border border-black rounded-full px-3 text-[13px]" /></label>
            <label className="text-[11px]">ETD<input type="date" value={form.etd?form.etd.slice(0,10):""} onChange={e=>setForm({...form, etd:e.target.value})} className="mt-1 w-full h-9 border border-black rounded-full px-3 text-[13px]" /></label>
            <label className="text-[11px]">ETA<input type="date" value={form.eta?form.eta.slice(0,10):""} onChange={e=>setForm({...form, eta:e.target.value})} className="mt-1 w-full h-9 border border-black rounded-full px-3 text-[13px]" /></label>
            <label className="col-span-2 text-[11px]">NOTES - Room {room?.name} • {productsLabel}<textarea value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} rows={3} className="mt-1 w-full border border-black rounded-[12px] p-3 text-[13px]" /></label>
            <div className="col-span-2 flex gap-2"><button onClick={()=>setEditing(false)} className="h-10 px-6 rounded-full border border-black bg-white text-sm">Cancel</button><button onClick={save} className="h-10 px-6 rounded-full bg-[#ea580c] text-white text-sm flex-1">Save → buyer room {room?.name} sees live</button></div>
          </div>
        )}
      </main>
    </div>
  )
}
