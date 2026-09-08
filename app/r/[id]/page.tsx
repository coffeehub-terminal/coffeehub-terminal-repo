"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"
import Link from "next/link"

export default function BuyerPortalOrganized(){
  const params = useParams()
  const roomToken = params?.id as string
  const [room,setRoom]=useState<any>(null)
  const [offers,setOffers]=useState<any[]>([])
  const [pos,setPos]=useState<any[]>([])
  const [contracts,setContracts]=useState<any[]>([])
  const [logistics,setLogistics]=useState<any[]>([])
  const [sampleReqs,setSampleReqs]=useState<any[]>([])
  const [samples,setSamples]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [toast,setToast]=useState<{msg:string,color:string}|null>(null)

  const showToast = (msg:string,color:string="black")=>{
    setToast({msg,color})
    setTimeout(()=>setToast(null),5000)
  }

  const load = async()=>{
    setLoading(true)
    try{
      let r:any=null
      const tries=[{table:"Rooms",col:"share_token"},{table:"Rooms",col:"id"},{table:"Rooms",col:"name"}]
      for(const t of tries){
        try{ const {data}=await supabase.from(t.table).select("*").eq(t.col, roomToken).maybeSingle(); if(data){r=data; break} }catch{}
      }
      if(!r) r={ id: roomToken, name: roomToken.slice(0,8), offer_ids:"", share_token:roomToken, status:"Active", created_at:new Date().toISOString() }
      setRoom(r)
      const offerIds=(r.offer_ids||"").split(",").map((s:string)=>s.trim()).filter(Boolean)
      let offerList:any[]=[]
      if(offerIds.length>0){
        const {data}=await supabase.from("Offers").select("*").in("id", offerIds)
        offerList=data||[]
        if(offerList.length===0){
          const {data: byLot}=await supabase.from("Offers").select("*").in("lot_number", offerIds)
          offerList=byLot||[]
        }
      } else {
        // fallback: show last 5 offers for this room if offer_ids empty
        const {data: allOff}=await supabase.from("Offers").select("*").order("created_at",{ascending:false}).limit(5)
        offerList=allOff||[]
      }
      setOffers(offerList)

      const {data: po1}=await supabase.from("PurchaseOrders").select("*").eq("room_id", r.id).order("created_at",{ascending:false})
      const {data: po2}=await supabase.from("PurchaseOrders").select("*").eq("room_id", roomToken).order("created_at",{ascending:false})
      const allPO=[...(po1||[]), ...(po2||[])].filter((v,i,a)=>a.findIndex(t=>t.id===v.id)===i)
      setPos(allPO)

      const poIds=allPO.map(p=>p.id)
      let allContracts:any[]=[]
      const {data: ctByRoom}=await supabase.from("Contracts").select("*").eq("room_id", r.id)
      const {data: ctByToken}=await supabase.from("Contracts").select("*").eq("room_id", roomToken)
      allContracts=[...(ctByRoom||[]), ...(ctByToken||[])]
      if(poIds.length>0){
        const {data: ctByPO}=await supabase.from("Contracts").select("*").in("purchase_order_id", poIds)
        allContracts=[...allContracts, ...(ctByPO||[])]
      }
      allContracts=allContracts.filter((v,i,a)=>a.findIndex(t=>t.id===v.id)===i)
      setContracts(allContracts)

      const ctIds=allContracts.map(c=>c.id)
      let allLogs:any[]=[]
      const {data: logByRoom}=await supabase.from("Logistics").select("*").eq("room_id", r.id)
      const {data: logByToken}=await supabase.from("Logistics").select("*").eq("room_id", roomToken)
      allLogs=[...(logByRoom||[]), ...(logByToken||[])]
      if(ctIds.length>0){
        try{ const {data: logByCt}=await supabase.from("Logistics").select("*").in("contract_id", ctIds); allLogs=[...allLogs, ...(logByCt||[])] }catch{}
        for(const cid of ctIds){
          const num=parseInt(String(cid)); if(!isNaN(num)){ try{ const {data}=await supabase.from("Logistics").select("*").eq("contract_id", num); if(data) allLogs=[...allLogs, ...data] }catch{} }
        }
      }
      allLogs=allLogs.filter((v,i,a)=>a.findIndex(t=>String(t.id)===String(v.id))===i)
      setLogistics(allLogs)

      const {data: sreq1}=await supabase.from("SampleRequests").select("*").eq("room_id", r.id).order("created_at",{ascending:false})
      const {data: sreq2}=await supabase.from("SampleRequests").select("*").eq("room_id", roomToken).order("created_at",{ascending:false})
      const allSReq=[...(sreq1||[]), ...(sreq2||[])].filter((v,i,a)=>a.findIndex(t=>t.id===v.id)===i)
      setSampleReqs(allSReq)
      if(allSReq.length>0){
        const reqIds=allSReq.map(s=>s.id)
        const {data: samps}=await supabase.from("Samples").select("*").in("sample_request_id", reqIds)
        const {data: sampsByRoom}=await supabase.from("Samples").select("*").eq("room_id", r.id)
        const {data: sampsByToken}=await supabase.from("Samples").select("*").eq("room_id", roomToken)
        const allSamps=[...(samps||[]), ...(sampsByRoom||[]), ...(sampsByToken||[])].filter((v,i,a)=>a.findIndex(t=>t.id===v.id)===i)
        setSamples(allSamps)
      }
    }catch(e){ console.error(e) }
    setLoading(false)
  }

  useEffect(()=>{
    load()
    const ch=supabase.channel(`room-org-${roomToken}`)
      .on('postgres_changes',{event:'*',schema:'public',table:'PurchaseOrders'},()=>{ showToast("📦 Purchase Order updated - buyer sees live","#2563eb"); load() })
      .on('postgres_changes',{event:'*',schema:'public',table:'Contracts'},()=>{ showToast("📄 Contract updated - buyer sees live","#7c3aed"); load() })
      .on('postgres_changes',{event:'*',schema:'public',table:'Logistics'},()=>{ showToast("🚢 Logistics updated - buyer sees live","#ea580c"); load() })
      .on('postgres_changes',{event:'*',schema:'public',table:'Samples'},()=>{ showToast("🧪 Sample status updated - buyer sees live","#16a34a"); load() })
      .subscribe()
    return ()=>{ supabase.removeChannel(ch) }
  },[roomToken])

  const handleRequestSample = async()=>{
    try{
      showToast("Creating Sample Request...","#16a34a")
      const reqId=crypto.randomUUID()
      await supabase.from("SampleRequests").insert({ id:reqId, room_id:room?.id||roomToken, buyer_email:"extraroom@test.com", status:"Approved", notes:`Sample for ${offers.map(o=>o.lot_number||o.id).join(", ")}` })
      for(const o of offers){ try{ await supabase.from("SampleRequestOffers").insert({ id:crypto.randomUUID(), sample_request_id:reqId, offer_id:o.id }) }catch{} }
      await supabase.from("Samples").insert({ id:crypto.randomUUID(), sample_request_id:reqId, room_id:room?.id||roomToken, buyer_email:"extraroom@test.com", status:"Preparing", notes:"Seller is preparing your sample..." })
      await fetch("/api/notify-seller",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({type:"SAMPLE_REQUEST", lots:offers.map(o=>o.lot_number||o.id).join(", "), room_token:roomToken})})
      showToast("✅ Sample requested - seller fills courier/tracking in /samples","#16a34a")
      load()
    }catch(e:any){ showToast(`❌ ${e.message}`,"#dc2626") }
  }

  const handleBuy = async(offer:any)=>{
    try{
      showToast(`Buy ${offer.lot_number} - creating PO...`,"#2563eb")
      const poId=crypto.randomUUID()
      const {error}=await supabase.from("PurchaseOrders").insert({ id:poId, room_id:room?.id||roomToken, buyer_email:"aviancoffee@gmail.com", offer_id:offer.id, quantity:1, price:offer.price_per_kg||9, status:"Approved" })
      if(error) throw error
      await fetch("/api/notify-seller",{method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({type:"BUY", lot_id:offer.id, lot_ref:offer.lot_number, room_token:roomToken, price:offer.price_per_kg})})
      showToast(`✅ PO created for ${offer.lot_number} in room ${room?.name} - now create Contract in Seller OS`,"#2563eb")
      load()
    }catch(e:any){ showToast(`❌ ${e.message}`,"#dc2626") }
  }

  if(loading) return <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center"><div className="border border-black rounded-full px-6 py-3 text-sm">Loading {roomToken}...</div></div>

  const roomLabel = `${room?.name||roomToken} • ROOM-${String(room?.id||roomToken).slice(0,4).toUpperCase()}`
  const roomDate = room?.created_at ? new Date(room.created_at).toLocaleDateString() : new Date().toLocaleDateString()
  const productsLabel = offers.map(o=>`${o.lot_number||o.id} • ${o.origin||"Colombia"} • $${o.price_per_kg||o.price}/kg`).join(" | ") || "No products linked"

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="border-b bg-white sticky top-0 z-20">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-black text-white rounded-md flex items-center justify-center text-[11px] font-bold">CH</div>
            <span className="font-semibold text-[14px]">CoffeeHub Buyer Portal</span>
            <span className="text-[11px] bg-black text-white rounded-full px-2 py-0.5">{roomLabel}</span>
            <span className="text-[11px] text-neutral-500">{roomDate} • Offers: {offers.length} • {room?.status||"Active"}</span>
          </div>
          <span className="text-[11px]">{room?.buyer_email||"aviancoffee@gmail.com"} • VIEW ONLY</span>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-4 space-y-4">
        {toast && <div className="fixed top-16 left-1/2 -translate-x-1/2 text-white rounded-full px-4 py-2 text-sm z-50 shadow-lg" style={{background:toast.color}}>{toast.msg}</div>}

        {/* ROOM BANNER - always visible */}
        <div className="bg-black text-white rounded-[16px] p-4 flex justify-between items-center">
          <div>
            <div className="text-[12px] uppercase tracking-widest opacity-70">Room</div>
            <div className="text-[18px] font-bold">{room?.name||roomToken} • {String(room?.id||roomToken).slice(0,8)} • Created {roomDate}</div>
            <div className="text-[11px] opacity-80 mt-1">Products: {productsLabel}</div>
          </div>
          <div className="text-right"><div className="text-[11px] opacity-70">Status</div><div className="text-[14px] font-semibold bg-white text-black rounded-full px-3 py-1 mt-1">{room?.status||"Active"}</div></div>
        </div>

        {/* Sample - GREEN notification */}
        <div className="border border-black rounded-[16px] p-4" style={{borderColor: samples.length>0 ? "#16a34a" : "black", borderWidth: samples.length>0 ? "2px" : "1px"}}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span>
              <span className="text-[13px] font-semibold">Sample Request • Room {room?.name} • {roomDate} • {productsLabel.slice(0,60)}</span>
              {samples.length>0 && <span className="text-[10px] bg-[#16a34a] text-white rounded-full px-2 py-0.5">SAMPLE {samples[0].status?.toUpperCase()}</span>}
            </div>
            <button onClick={handleRequestSample} className="h-8 px-4 rounded-full bg-black text-white text-[12px]">Request Sample ({offers.length||1})</button>
          </div>
          {samples.length>0 ? (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {samples.map((s:any)=><div key={s.id} className="border rounded-[12px] p-3 text-[11px]" style={{borderColor:"#16a34a", background:"#f0fdf4"}}><b style={{color:"#16a34a"}}>{s.status}</b> • Courier {s.courier||"-"} • Tracking {s.tracking_number||"-"} • Room {room?.name}<br/><span className="text-neutral-600">{s.notes} • Products: {productsLabel}</span></div>)}
            </div>
          ) : <div className="mt-2 text-[11px] text-neutral-500">No sample yet - Room {room?.name} • {productsLabel}</div>}
        </div>

        {/* Available Coffees - with room info */}
        <div className="bg-[#fbfaf8] border border-black rounded-[16px] p-4">
          <div className="text-[13px] font-semibold">Available Coffees - Room {room?.name} • {roomDate} • ROOM-{String(room?.id).slice(0,4).toUpperCase()}</div>
          <div className="text-[11px] text-neutral-500 mt-1">Products being sold in this room: {productsLabel}</div>
          {offers.map((o:any)=>(
            <div key={o.id} className="flex items-center justify-between border-b last:border-0 py-3">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked readOnly />
                <div><div className="text-[13px] font-medium">{o.lot_number||o.id} • {o.origin||"colombia"} • ${o.price_per_kg||o.price}/kg • Room {room?.name} • {roomDate}</div><div className="text-[11px] text-neutral-500">{o.company_name||"tricolor"} • ROOM-{String(room?.id).slice(0,4).toUpperCase()} • {o.variety||"caturra"} • {o.process||"washed"} • Products: {o.lot_number}</div></div>
              </div>
              <div className="flex gap-2"><Link href={`/offers/${o.id}`} className="border border-black rounded-full px-3 py-1 text-[11px]">View Coffee →</Link><button onClick={()=>handleBuy(o)} className="bg-black text-white rounded-full px-4 py-1 text-[11px]">Buy</button></div>
            </div>
          ))}
        </div>

        {/* Purchase Orders - BLUE notification */}
        <div className="border rounded-[16px] p-4" style={{borderColor: pos.length>0 ? "#2563eb" : "black", borderWidth: pos.length>0 ? "2px" : "1px", background: pos.length>0 ? "#eff6ff" : "#fbfaf8"}}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2563eb]"></span>
            <span className="text-[13px] font-semibold">Purchase Orders • {pos.length} • Room {room?.name} • {roomDate} • Products: {productsLabel.slice(0,60)}</span>
            {pos.length>0 && <span className="text-[10px] bg-[#2563eb] text-white rounded-full px-2 py-0.5">PO APPROVED</span>}
          </div>
          {pos.length===0 ? <div className="text-[11px] text-neutral-500 mt-2">No POs yet - Room {room?.name} • Click Buy above to create PO</div> : pos.map((po:any)=><div key={po.id} className="flex justify-between items-center mt-2 text-[12px]"><span>{po.buyer_email} • Room {room?.name} ({po.room_id.slice(0,8)}) • {po.offer_id} • {roomDate} • Products: {offers.find(o=>o.id===po.offer_id)?.lot_number||po.offer_id} • Qty {po.quantity} • {po.status}</span><Link href={`/purchase-orders/${po.id}`} className="border border-black rounded-full px-3 py-1 text-[11px] bg-white">View PO →</Link></div>)}
        </div>

        {/* Contracts - PURPLE notification */}
        <div className="border rounded-[16px] p-4" style={{borderColor: contracts.length>0 ? "#7c3aed" : "black", borderWidth: contracts.length>0 ? "2px" : "1px", background: contracts.length>0 ? "#f5f3ff" : "#fbfaf8"}}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#7c3aed]"></span>
            <span className="text-[13px] font-semibold">Contracts • {contracts.length} • Room {room?.name} • {roomDate} • Products: {productsLabel.slice(0,60)} • Buyer sees what you save</span>
            {contracts.length>0 && <span className="text-[10px] bg-[#7c3aed] text-white rounded-full px-2 py-0.5">CONTRACT {contracts[0].status?.toUpperCase()}</span>}
          </div>
          {contracts.length===0 ? <div className="text-[11px] text-neutral-500 mt-2">No contracts yet - Room {room?.name} • Buy creates PO, you create Contract in /purchase-orders → Create Contract</div> : contracts.map((c:any)=><div key={c.id} className="flex justify-between items-center mt-2 text-[12px]"><span>{c.buyer_email} • Room {room?.name} ({String(c.room_id).slice(0,8)}) • {c.contract_number} • {roomDate} • Products: {productsLabel} • {c.status} • ${c.price}</span><Link href={`/contracts/${c.id}`} className="border border-black rounded-full px-3 py-1 text-[11px] bg-white">View Contract →</Link></div>)}
        </div>

        {/* Logistics - ORANGE notification */}
        <div className="border rounded-[16px] p-4" style={{borderColor: logistics.length>0 ? "#ea580c" : "black", borderWidth: logistics.length>0 ? "2px" : "1px", background: logistics.length>0 ? "#fff7ed" : "#fbfaf8"}}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ea580c]"></span>
            <span className="text-[13px] font-semibold">Logistics • {logistics.length} • Room {room?.name} • {roomDate} • Products: {productsLabel.slice(0,60)} • Buyer sees what you save</span>
            {logistics.length>0 && <span className="text-[10px] bg-[#ea580c] text-white rounded-full px-2 py-0.5">LOGISTICS {logistics[0].status?.toUpperCase()}</span>}
          </div>
          {logistics.length===0 ? <div className="text-[11px] text-neutral-500 mt-2">No logistics yet - Room {room?.name} • Contract creates Logistics, you fill container/vessel/ETD/ETA in /contracts → Create Logistics</div> : logistics.map((l:any)=><div key={l.id} className="flex justify-between items-center mt-2 text-[12px]"><span>{l.buyer_email} • Room {room?.name} ({String(l.room_id).slice(0,8)}) • {l.booking_number} • {roomDate} • {l.container_number||"-"} • {l.vessel_name||l.vessel||"-"}</span><Link href={`/logistics/${l.id}`} className="border border-black rounded-full px-3 py-1 text-[11px] bg-white">View Logistics →</Link></div>)}
        </div>

      </main>
    </div>
  )
}
