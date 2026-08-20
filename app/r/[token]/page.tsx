"use client"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
export default function BuyerPortal(){
  const {token}=useParams() as any
  const [room,setRoom]=useState<any>(null)
  const [participants,setParticipants]=useState<any[]>([])
  const [offers,setOffers]=useState<any[]>([])
  const [samples,setSamples]=useState<any[]>([])
  const [pos,setPos]=useState<any[]>([])
  const [contracts,setContracts]=useState<any[]>([])
  const [logistics,setLogistics]=useState<any[]>([])
  const [selected,setSelected]=useState<string[]>([])
  const [buyQty,setBuyQty]=useState<{[k:string]:number}>({})
  const [loading,setLoading]=useState(true)
  const [actionLoading,setActionLoading]=useState(false)
  const [viewing,setViewing]=useState<any>(null)
  const [toast,setToast]=useState<string>("")
  const safeId = (id:any)=> String(id||"").slice(0,8)
  useEffect(()=>{
    if(!token) return
    const load=async()=>{
      const {data:roomData}=await supabase.from("Rooms").select("*").eq("share_token",token).single()
      if(!roomData) { setLoading(false); return }
      setRoom(roomData)
      const {data:parts}=await supabase.from("RoomParticipants").select("*").eq("room_id",roomData.id)
      setParticipants(parts||[])
      if(roomData.offer_ids){
        const ids=roomData.offer_ids.split(",").map((s:string)=>s.trim()).filter(Boolean)
        if(ids.length){
          const {data:offData}=await supabase.from("Offers").select("*").in("id",ids)
          setOffers(offData||[]); setSelected(ids)
        }
      }
      const {data:samp}=await supabase.from("Samples").select("*").eq("room_id",roomData.id).order("created_at",{ascending:false})
      const {data:po}=await supabase.from("PurchaseOrders").select("*").eq("room_id",roomData.id).order("created_at",{ascending:false})
      const {data:cont}=await supabase.from("Contracts").select("*").eq("room_id",roomData.id).order("created_at",{ascending:false})
      const {data:log}=await supabase.from("Logistics").select("*").eq("room_id",roomData.id).order("created_at",{ascending:false})
      setSamples(samp||[]); setPos(po||[]); setContracts(cont||[]); setLogistics(log||[])
      setLoading(false)
      const channel = supabase.channel(`room-${roomData.id}`)
       .on('postgres_changes',{event:'*',schema:'public',table:'Samples',filter:`room_id=eq.${roomData.id}`}, async()=>{ const {data}=await supabase.from("Samples").select("*").eq("room_id",roomData.id).order("created_at",{ascending:false}); setSamples(data||[]) })
       .on('postgres_changes',{event:'*',schema:'public',table:'PurchaseOrders',filter:`room_id=eq.${roomData.id}`}, async()=>{ const {data}=await supabase.from("PurchaseOrders").select("*").eq("room_id",roomData.id).order("created_at",{ascending:false}); setPos(data||[]) })
       .on('postgres_changes',{event:'*',schema:'public',table:'Contracts',filter:`room_id=eq.${roomData.id}`}, async()=>{ const {data}=await supabase.from("Contracts").select("*").eq("room_id",roomData.id).order("created_at",{ascending:false}); setContracts(data||[]) })
       .on('postgres_changes',{event:'*',schema:'public',table:'Logistics',filter:`room_id=eq.${roomData.id}`}, async()=>{ const {data}=await supabase.from("Logistics").select("*").eq("room_id",roomData.id).order("created_at",{ascending:false}); setLogistics(data||[]) })
       .subscribe()
      return ()=>{ supabase.removeChannel(channel) }
    }
    load()
  },[token])
  const buyerEmail = participants?.[0]?.email || room?.participant_email || "buyer@anonymous.com"
  const getProgress=(s:string)=>{ const steps=["Preparing","Shipped","Delivered"]; return {steps, idx: steps.indexOf(s)===-1?0:steps.indexOf(s)} }
  const showToast=(msg:string)=>{ setToast(msg); setTimeout(()=>setToast(""),4000) }

  const requestSample=async()=>{
    if(!room||selected.length===0) return
    setActionLoading(true)
    const {data:reqData}=await supabase.from("SampleRequests").insert({room_id:room.id, buyer_email:buyerEmail, status:"Pending"}).select().single()
    await supabase.from("SampleRequestOffers").insert(selected.map(offer_id=>({sample_request_id:reqData.id, offer_id})))
    await supabase.from("Samples").insert({sample_request_id:reqData.id, room_id:room.id, buyer_email:buyerEmail, status:"Preparing"})
    setActionLoading(false)
    showToast(`✅ Your samples are being prepared! ${selected.length} coffee(s) - exporter will add DHL tracking, green bar will move.`)
  }
  const buyCoffee=async(offer:any)=>{
    const qty=buyQty[offer.id]||1
    setActionLoading(true)
    const {data:po}=await supabase.from("PurchaseOrders").insert({room_id:room.id, buyer_email:buyerEmail, offer_id:offer.id, quantity:qty, price:offer.price_per_kg, status:"Pending"}).select().single()
    const {data:contract}=await supabase.from("Contracts").insert({purchase_order_id:po.id, room_id:room.id, buyer_email:buyerEmail, status:"Draft", contract_number:`CT-${safeId(po.id).toUpperCase()}`, price:offer.price_per_kg, incoterm:"FOB", shipment_window:"30 DAYS", payment_terms:"100%"}).select().single()
    await supabase.from("Logistics").insert({contract_id:contract.id, room_id:room.id, buyer_email:buyerEmail, status:"Booked", booking_number:`BK-${Date.now()}`})
    setActionLoading(false)
    showToast(`✅ Purchase order placed! ${qty} bag(s) of ${offer.lot_number} at $${offer.price_per_kg}/kg. Contract ${contract.contract_number} drafted - seller will confirm.`)
  }

  if(loading) return <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center">Loading...</div>
  if(!room) return <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center">Room not found</div>

  return (
    <div className="min-h-screen bg-[#fbfaf8]">
      {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full text-sm z-[100] shadow-2xl animate-bounce">{toast}</div>}
      <header className="border-b bg-white sticky top-0 z-20"><div className="max-w- mx-auto px-6 h- flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-xs">CH</div><span className="font-semibold text-sm">CoffeeHub Buyer Portal</span><span className="text-xs px-3 py-1 rounded-full border bg-white">{room.id} • {room.name}</span></div><span className="text-xs text-neutral-400">{buyerEmail} • VIEW ONLY</span></div></header>
      <main className="max-w- mx-auto px-6 py-6 space-y-4">
        <div className="bg-white rounded-2xl border px-5 py-4 flex justify-between text-sm"><div>Offers: <b>{offers.length}</b></div><div>Room: <b>{room.name}</b></div><div>Status: <b>{room.status}</b></div></div>

        {samples.length>0 && (
          <div className="bg-white rounded-2xl border p-5"><h3 className="font-semibold text-sm mb-3">Sample Shipment • {samples[0]?.status} - LIVE</h3>
            {samples.slice(0,2).map((s:any)=>{ const {steps, idx}=getProgress(s.status); return (<div key={String(s.id)} className="mb-4 last:mb-0"><div className="flex gap-2 mb-2">{steps.map((step:string,i:number)=>(<div key={step} className="flex-1"><div className={`h-2 rounded-full ${i<=idx? "bg-green-500" : "bg-neutral-100"}`}></div><div className={`text- mt-1 ${i<=idx? "text-green-600 font-medium" : "text-neutral-400"}`}>{step}</div></div>))}</div><div className="flex justify-between text-xs text-neutral-500 bg-[#fbfaf8] border rounded-xl px-3 py-2"><span>{s.buyer_email} • {s.room_id} • {s.courier||"Pending"} {s.tracking_number && `• ${s.tracking_number}`}</span><span>{safeId(s.id)} • {new Date(s.created_at).toLocaleDateString()}</span></div></div>)})}
          </div>
        )}

        <div className="bg-white rounded-2xl border p-5"><h3 className="font-semibold text-sm">Need a sample?</h3><p className="text-xs text-neutral-400 mt-1">Buyer VIEW ONLY - immediate confirmation below</p><div className="flex gap-2 mt-3"><button disabled={actionLoading} onClick={requestSample} className="px-4 py-2 rounded-full bg-black text-white text-xs hover:bg-neutral-800 active:scale-95">Request Sample ({selected.length})</button></div></div>

        <div className="bg-white rounded-2xl border overflow-hidden"><div className="px-5 py-3 border-b font-semibold text-sm">Available Coffees - {room.name}</div>
          {offers.map((o:any)=>(
            <div key={String(o.id)} className="flex items-center justify-between px-5 py-4 border-b last:border-0 hover:bg-[#fbfaf8]">
              <div className="flex items-center gap-3"><input type="checkbox" checked={selected.includes(o.id)} onChange={e=>{if(e.target.checked) setSelected([...selected,o.id]); else setSelected(selected.filter(id=>id!==o.id))}}/><div><div className="text-sm font-medium">{o.lot_number} • {o.origin} • ${o.price_per_kg}/kg</div><div className="text-xs text-neutral-400">{buyerEmail} • {room.id} • {o.farm||""} • {o.variety||""}</div></div></div>
              <div className="flex gap-2 items-center"><input type="number" min={1} value={buyQty[o.id]||1} onChange={e=>setBuyQty({...buyQty,[o.id]:Number(e.target.value)})} className="w-14 border rounded-full px-2 py-1 text-xs text-center"/><a href={`/lot/${o.lot_number}`} target="_blank" className="px-3 py-1.5 rounded-full border bg-white text-xs hover:bg-black hover:text-white transition-all">View Coffee →</a><button disabled={actionLoading} onClick={()=>buyCoffee(o)} className="px-3 py-1.5 rounded-full bg-black text-white text-xs hover:bg-neutral-800 active:scale-95">Buy</button></div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border overflow-hidden"><div className="px-5 py-3 border-b font-semibold text-sm">Purchase Orders • {pos.length}</div>{pos.map((p:any)=>(<div key={String(p.id)} className="px-5 py-3 border-b last:border-0 text-sm flex justify-between items-center"><span>{p.buyer_email} • {p.room_id} • {String(p.offer_id).slice(0,12)} • Qty {p.quantity} • {p.status}</span><button onClick={()=>setViewing({type:"po", data:p})} className="text-xs px-3 py-1.5 rounded-full border hover:bg-black hover:text-white">View PO →</button></div>))}</div>
        <div className="bg-white rounded-2xl border overflow-hidden"><div className="px-5 py-3 border-b font-semibold text-sm">Contracts • {contracts.length} - Buyer sees what you save</div>{contracts.map((c:any)=>(<div key={String(c.id)} className="px-5 py-3 border-b last:border-0 text-sm flex justify-between items-center"><span>{c.buyer_email} • {c.room_id} • {c.contract_number} • {c.status} • ${c.price} • FOB {c.shipment_window}</span><button onClick={()=>setViewing({type:"contract", data:c})} className="text-xs px-3 py-1.5 rounded-full border hover:bg-black hover:text-white">View Contract →</button></div>))}</div>
        <div className="bg-white rounded-2xl border overflow-hidden"><div className="px-5 py-3 border-b font-semibold text-sm">Logistics • {logistics.length} - Buyer sees what you save</div>{logistics.map((l:any)=>(<div key={String(l.id)} className="px-5 py-3 border-b last:border-0 text-sm flex justify-between items-center"><span>{l.buyer_email} • {l.room_id} • {l.booking_number} • {l.status} • {l.vessel_name||"-"}</span><button onClick={()=>setViewing({type:"logistics", data:l})} className="text-xs px-3 py-1.5 rounded-full border hover:bg-black hover:text-white">View Logistics →</button></div>))}</div>
      </main>

      {viewing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w- p-6 border shadow-2xl max-h- overflow-auto">
            <div className="flex justify-between items-start mb-4"><div><h3 className="font-bold text-sm">{viewing.type.toUpperCase()} • {safeId(viewing.data.id)}</h3><p className="text-xs text-neutral-500 mt-1">{viewing.data.buyer_email} • {viewing.data.room_id} • {room.name}</p></div><button onClick={()=>setViewing(null)} className="px-3 py-1 rounded-full border text-xs hover:bg-black hover:text-white">Close</button></div>
            <div className="bg-[#fbfaf8] border rounded-xl p-4 text-xs space-y-2">
              {viewing.type==="contract" && (
                <>
                  <div className="grid grid-cols-2 gap-2"><div><b>Contract:</b> {viewing.data.contract_number}</div><div><b>Status:</b> {viewing.data.status}</div></div>
                  <div className="grid grid-cols-2 gap-2"><div><b>Incoterm:</b> {viewing.data.incoterm}</div><div><b>Shipment:</b> {viewing.data.shipment_window}</div></div>
                  <div className="grid grid-cols-2 gap-2"><div><b>Payment:</b> {viewing.data.payment_terms}</div><div><b>Price:</b> ${viewing.data.price}</div></div>
                  <div><b>PO:</b> {String(viewing.data.purchase_order_id).slice(0,8)} • <b>Room:</b> {viewing.data.room_id} • {room.name}</div>
                  {viewing.data.special_conditions && <div><b>Conditions:</b> {viewing.data.special_conditions}</div>}
                  <div className="pt-2 text- text-neutral-400">This is the full contract seller saved - incoterm, shipment window, payment, price. Buyer VIEW ONLY.</div>
                </>
              )}
              {viewing.type==="po" && (<><div><b>PO:</b> {safeId(viewing.data.id)} • <b>Offer:</b> {String(viewing.data.offer_id).slice(0,12)} • <b>Room:</b> {viewing.data.room_id}</div><div><b>Qty:</b> {viewing.data.quantity} • <b>Price:</b> ${viewing.data.price} • <b>Status:</b> {viewing.data.status}</div></>)}
              {viewing.type==="logistics" && (<><div><b>Booking:</b> {viewing.data.booking_number} • <b>Container:</b> {viewing.data.container_number||"-"} {viewing.data.container_size||""}</div><div><b>Line:</b> {viewing.data.shipping_line||"-"} • <b>Vessel:</b> {viewing.data.vessel_name||"-"} • <b>Voyage:</b> {viewing.data.voyage_number||"-"}</div><div><b>BL:</b> {viewing.data.bill_of_lading||viewing.data.bill_of_landing||"-"} • <b>Ports:</b> {viewing.data.departure_port||"-"} → {viewing.data.arrival_port||"-"}</div><div><b>ETD:</b> {viewing.data.etd||"-"} • <b>ETA:</b> {viewing.data.eta||"-"} • <b>Forwarder:</b> {viewing.data.freight_forwarder||"-"}</div></>)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
