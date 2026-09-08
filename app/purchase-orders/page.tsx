"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function POPage(){
  const [pos,setPos]=useState<any[]>([])
  const [contracts,setContracts]=useState<any[]>([])
  const [rooms,setRooms]=useState<any[]>([])
  const [offers,setOffers]=useState<any[]>([])
  const [loading,setLoading]=useState(true)
  const [toast,setToast]=useState("")

  const load=async()=>{
    setLoading(true)
    const [{data:po},{data:ct},{data:rm},{data:off}]=await Promise.all([
      supabase.from("PurchaseOrders").select("*").order("created_at",{ascending:false}).limit(100),
      supabase.from("Contracts").select("*").order("created_at",{ascending:false}).limit(100),
      supabase.from("Rooms").select("*").order("created_at",{ascending:false}).limit(100),
      supabase.from("Offers").select("*").order("created_at",{ascending:false}).limit(100)
    ])
    setPos(po||[]); setContracts(ct||[]); setRooms(rm||[]); setOffers(off||[])
    setLoading(false)
  }
  useEffect(()=>{load()},[])

  const getRoom = (roomId:string)=> rooms.find(r=> r.id===roomId || r.share_token===roomId || String(r.id).startsWith(String(roomId).slice(0,4))) || { name: roomId?.slice(0,8)||"Unknown", id: roomId, created_at: null, offer_ids:"" }
  const getProducts = (room:any)=>{
    const oIds=(room?.offer_ids||"").split(",").filter(Boolean)
    const prods=offers.filter(o=> oIds.includes(o.id) || oIds.includes(o.lot_number))
    return prods.length>0 ? prods.map(p=>`${p.lot_number} $${p.price_per_kg}/kg`).join(", ") : (room?.offer_ids||"Products")
  }

  const createContract = async(po:any)=>{
    try{
      setToast(`Creating Contract for PO ${po.id.slice(0,8)}... Room ${getRoom(po.room_id).name}`)
      const ctNum=`CT-${po.id.slice(0,8).toUpperCase()}`
      const { data, error } = await supabase.from("Contracts").insert({
        purchase_order_id: po.id,
        room_id: po.room_id,
        buyer_email: po.buyer_email,
        status: "Draft",
        contract_number: ctNum,
        price: po.price,
        incoterm: "FOB",
        shipment_window: "30 DAYS",
        payment_terms: "100% before shipment",
        special_conditions: ""
      }).select().single()
      if(error) throw error
      await supabase.from("PurchaseOrders").update({status:"Contracted"}).eq("id", po.id)
      setToast(`✅ Contract ${ctNum} (id ${data.id}) created for room ${getRoom(po.room_id).name} → buyer sees live`)
      load()
      setTimeout(()=>setToast(""),4000)
    }catch(e:any){ setToast(`❌ ${e.message}`); console.error(e) }
  }

  if(loading) return <div className="min-h-screen flex items-center justify-center">Loading POs...</div>
  return (
    <div className="min-h-screen bg-[#fbfaf8] text-black">
      <header className="border-b bg-white sticky top-0 z-20"><div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-7 h-7 bg-black text-white rounded-md flex items-center justify-center text-[11px] font-bold">CH</div><span className="font-semibold">Purchase Orders • {pos.length} → Contracts • {contracts.length}</span></div><div className="flex gap-2"><Link href="/" className="border border-black rounded-full px-3 py-1.5 text-xs">← Seller OS</Link><Link href="/contracts" className="bg-black text-white rounded-full px-3 py-1.5 text-xs">Contracts →</Link></div></div></header>
      <main className="max-w-[1400px] mx-auto px-6 py-6">
        {toast && <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-black text-white rounded-full px-4 py-2 text-sm z-50">{toast}</div>}
        {pos.length===0 && <div className="bg-white border border-black rounded-[16px] p-12 text-center text-sm">No POs yet. Buyer clicks Buy in /r/[id] to create PO.</div>}
        <div className="grid grid-cols-1 gap-4">
          {pos.map((po:any)=>{
            const room=getRoom(po.room_id)
            const products=getProducts(room)
            const ct=contracts.find((c:any)=>c.purchase_order_id===po.id)
            const dateLabel=po.created_at?new Date(po.created_at).toLocaleString():""
            const roomDate=room?.created_at?new Date(room.created_at).toLocaleDateString():""
            return (
              <div key={po.id} className="bg-white border border-black rounded-[16px] p-5">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono bg-black text-white rounded-full px-2 py-0.5">{room.name}</span>
                      <span className="text-[11px] font-mono">Room {String(room.id).slice(0,8)} • PO {po.id.slice(0,8)} • {dateLabel} • Room created {roomDate}</span>
                    </div>
                    <div className="text-[14px] font-semibold mt-2">{room.name} • {po.buyer_email} • {po.offer_id?.slice(0,20)} • Qty {po.quantity} • ${po.price}/kg • {po.status}</div>
                    <div className="text-[11px] mt-1 text-neutral-600">Products in this room: {products}</div>
                    {ct ? <div className="text-[11px] mt-1">→ Contract {ct.contract_number} (id {ct.id}) • {ct.status} • {ct.incoterm} • Room {room.name}</div> : <div className="text-[11px] mt-1 text-orange-600">No contract yet for {room.name} - click Create Contract → buyer will see Contracts • 1 for room {room.name}</div>}
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex gap-2">
                      <Link href={`/r/${po.room_id}`} className="border border-black rounded-full px-3 py-1.5 text-[11px]">Buyer room {room.name} →</Link>
                      {!ct ? <button onClick={()=>createContract(po)} className="bg-black text-white rounded-full px-4 py-2 text-[11px]">Create Contract →</button> : <Link href={`/contracts/${ct.id}`} className="bg-black text-white rounded-full px-4 py-2 text-[11px]">View Contract {ct.contract_number} →</Link>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
