"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function ContractsPage(){
  const [cts,setCts]=useState<any[]>([])
  const [logs,setLogs]=useState<any[]>([])
  const [rooms,setRooms]=useState<any[]>([])
  const [offers,setOffers]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [toast,setToast]=useState("")
  const [editing,setEditing]=useState<string|null>(null)
  const [form,setForm]=useState<any>({})

  const load=async()=>{
    const [{data},{data:l},{data:rm},{data:off}]=await Promise.all([
      supabase.from("Contracts").select("*").order("created_at",{ascending:false}).limit(100),
      supabase.from("Logistics").select("*").order("created_at",{ascending:false}).limit(100),
      supabase.from("Rooms").select("*").order("created_at",{ascending:false}).limit(100),
      supabase.from("Offers").select("*").order("created_at",{ascending:false}).limit(100)
    ])
    setCts(data||[]); setLogs(l||[]); setRooms(rm||[]); setOffers(off||[]); setLoading(false)
  }
  useEffect(()=>{load()},[])

  const getRoom = (roomId:string)=> rooms.find(r=> r.id===roomId || r.share_token===roomId) || { name: roomId?.slice(0,8)||"Unknown", id: roomId, created_at:null, offer_ids:"" }
  const getProducts = (room:any)=>{
    const oIds=(room?.offer_ids||"").split(",").filter(Boolean)
    const prods=offers.filter(o=> oIds.includes(o.id) || oIds.includes(o.lot_number))
    return prods.length>0 ? prods.map(p=>`${p.lot_number} $${p.price_per_kg}/kg`).join(", ") : ""
  }

  const createLogistics = async(c:any)=>{
    try{
      const room=getRoom(c.room_id)
      setToast(`Creating Logistics for Contract ${c.contract_number} • Room ${room.name}...`)
      const bkNum=`BK-${Date.now().toString().slice(-6)}`
      const { data, error } = await supabase.from("Logistics").insert({
        contract_id: c.id,
        booking_number: bkNum,
        status: "Booked",
        room_id: c.room_id,
        buyer_email: c.buyer_email,
        departure_port: "Buenaventura",
        arrival_port: "Rotterdam"
      }).select().single()
      if(error) throw error
      setToast(`✅ Logistics ${bkNum} (id ${data.id}) for room ${room.name} → buyer sees live`)
      load()
      setTimeout(()=>setToast(""),4000)
    }catch(e:any){ setToast(`❌ ${e.message}`) }
  }

  const startEdit=(c:any)=>{
    setEditing(String(c.id))
    setForm({ status:c.status||"Draft", incoterm:c.incoterm||"FOB", shipment_window:c.shipment_window||"30 DAYS", payment_terms:c.payment_terms||"100% before shipment", special_conditions:c.special_conditions||"", price:c.price||9 })
  }
  const save=async(id:string)=>{
    const num=parseInt(id)
    let error:any=null
    if(!isNaN(num)){ const {error:e}=await supabase.from("Contracts").update(form).eq("id", num); error=e }
    else { const {error:e}=await supabase.from("Contracts").update(form).eq("contract_number", id); error=e }
    if(error) setToast(`❌ ${error.message}`); else { setToast(`✅ Contract ${id} saved - buyer sees live`); setEditing(null); load() }
    setTimeout(()=>setToast(""),3000)
  }

  if(loading) return <div className="min-h-screen flex items-center justify-center">Loading contracts...</div>
  return (
    <div className="min-h-screen bg-[#fbfaf8] text-black">
      <header className="border-b bg-white sticky top-0 z-20"><div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between"><span className="font-semibold">Contracts • {cts.length} → Logistics • {logs.length}</span><div className="flex gap-2"><Link href="/" className="border border-black rounded-full px-3 py-1.5 text-xs">← Seller OS</Link><Link href="/logistics" className="bg-black text-white rounded-full px-3 py-1.5 text-xs">Logistics →</Link></div></div></header>
      <main className="max-w-[1400px] mx-auto px-6 py-6 grid grid-cols-1 gap-4">
        {toast && <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-black text-white rounded-full px-4 py-2 text-sm z-50">{toast}</div>}
        {cts.map((c:any)=>{
          const room=getRoom(c.room_id)
          const products=getProducts(room)
          const lg=logs.find((l:any)=>String(l.contract_id)===String(c.id))
          const isEditing=editing===String(c.id)
          const dateLabel=c.created_at?new Date(c.created_at).toLocaleString():""
          const roomDate=room?.created_at?new Date(room.created_at).toLocaleDateString():""
          return (
            <div key={c.id} className="bg-white border border-black rounded-[16px] p-5">
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono bg-black text-white rounded-full px-2 py-0.5">{room.name}</span>
                    <span className="text-[11px] font-mono">{c.contract_number} (id {c.id}) • PO {String(c.purchase_order_id).slice(0,8)} • Room {room.name} ({String(room.id).slice(0,8)}) • Created {dateLabel} • Room created {roomDate}</span>
                  </div>
                  <div className="text-[14px] font-semibold mt-2">{room.name} • {c.buyer_email} • {c.status} • ${c.price}/kg • {c.incoterm} • {c.payment_terms}</div>
                  <div className="text-[11px] mt-1 text-neutral-600">Products in room {room.name}: {products}</div>
                  {lg && <div className="text-[11px] mt-1">→ Logistics {lg.booking_number} (id {lg.id}) • {lg.status} • Room {room.name}</div>}
                </div>
                <div className="flex gap-2 items-start">
                  {!isEditing ? <button onClick={()=>startEdit(c)} className="h-8 px-4 rounded-full border border-black text-[11px]">Edit (Seller)</button> : <><button onClick={()=>setEditing(null)} className="h-8 px-3 rounded-full border border-black text-[11px]">Cancel</button><button onClick={()=>save(String(c.id))} className="h-8 px-3 rounded-full bg-black text-white text-[11px]">Save → {room.name} buyer live</button></>}
                  {!lg ? <button onClick={()=>createLogistics(c)} className="h-8 px-4 rounded-full bg-black text-white text-[11px]">Create Logistics →</button> : <Link href={`/logistics/${lg.id}`} className="h-8 px-4 rounded-full bg-black text-white text-[11px] flex items-center">View Logistics {lg.booking_number} →</Link>}
                </div>
              </div>
              {isEditing && <div className="mt-4 grid grid-cols-2 gap-3"><label className="text-[11px]">Status<select value={form.status} onChange={e=>setForm({...form, status:e.target.value})} className="mt-1 w-full h-9 border border-black rounded-full px-3 text-[13px]"><option>Draft</option><option>Sent</option><option>Signed</option></select></label><label className="text-[11px]">Incoterm<input value={form.incoterm} onChange={e=>setForm({...form, incoterm:e.target.value})} className="mt-1 w-full h-9 border border-black rounded-full px-3 text-[13px]" /></label><label className="text-[11px]">Shipment window<input value={form.shipment_window} onChange={e=>setForm({...form, shipment_window:e.target.value})} className="mt-1 w-full h-9 border border-black rounded-full px-3 text-[13px]" /></label><label className="text-[11px]">Payment<input value={form.payment_terms} onChange={e=>setForm({...form, payment_terms:e.target.value})} className="mt-1 w-full h-9 border border-black rounded-full px-3 text-[13px]" /></label><label className="col-span-2 text-[11px]">Conditions<textarea value={form.special_conditions} onChange={e=>setForm({...form, special_conditions:e.target.value})} rows={2} className="mt-1 w-full border border-black rounded-[12px] p-3 text-[13px]" /></label></div>}
              <div className="mt-3 flex gap-2"><Link href={`/r/${c.room_id}`} className="border border-black rounded-full px-3 py-1 text-[11px]">Buyer room {room.name} →</Link></div>
            </div>
          )
        })}
      </main>
    </div>
  )
}
