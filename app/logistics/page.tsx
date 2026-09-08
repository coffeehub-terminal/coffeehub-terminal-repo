"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function LogisticsList(){
  const [logs,setLogs]=useState<any[]>([])
  const [rooms,setRooms]=useState<any[]>([])
  const [offers,setOffers]=useState<any[]>([])
  const [loading,setLoading]=useState(true)

  const load=async()=>{
    const [{data},{data:rm},{data:off}]=await Promise.all([
      supabase.from("Logistics").select("*").order("created_at",{ascending:false}).limit(100),
      supabase.from("Rooms").select("*").order("created_at",{ascending:false}).limit(100),
      supabase.from("Offers").select("*").order("created_at",{ascending:false}).limit(100)
    ])
    setLogs(data||[]); setRooms(rm||[]); setOffers(off||[]); setLoading(false)
  }
  useEffect(()=>{load()},[])

  const getRoom=(roomId:string)=> rooms.find(r=> r.id===roomId || r.share_token===roomId) || { name: roomId?.slice(0,8)||"Unknown", id:roomId, created_at:null, offer_ids:"" }
  const getProducts=(room:any)=>{
    const oIds=(room?.offer_ids||"").split(",").filter(Boolean)
    const prods=offers.filter(o=> oIds.includes(o.id) || oIds.includes(o.lot_number))
    return prods.length>0 ? prods.map(p=>`${p.lot_number} $${p.price_per_kg}/kg`).join(", ") : ""
  }

  if(loading) return <div className="min-h-screen flex items-center justify-center">Loading logistics...</div>
  return (
    <div className="min-h-screen bg-[#fbfaf8] text-black">
      <header className="border-b bg-white sticky top-0 z-20"><div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between"><span className="font-semibold">Logistics • {logs.length} • Room name + date + products in every card</span><div className="flex gap-2"><Link href="/" className="border border-black rounded-full px-3 py-1.5 text-xs">← Seller OS</Link><Link href="/contracts" className="border border-black rounded-full px-3 py-1.5 text-xs">← Contracts</Link></div></div></header>
      <main className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="grid grid-cols-2 gap-4">
          {logs.map((l:any)=>{
            const room=getRoom(l.room_id)
            const products=getProducts(room)
            const dateLabel=l.created_at?new Date(l.created_at).toLocaleString():""
            const roomDate=room?.created_at?new Date(room.created_at).toLocaleDateString():""
            return (
              <Link key={l.id} href={`/logistics/${l.id}`} className="bg-white border border-black rounded-[16px] p-5 hover:bg-[#fff7ed] transition">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono bg-black text-white rounded-full px-2 py-0.5">{room.name}</span>
                  <span className="text-[11px] font-mono">{l.booking_number} • Room {room.name} (ROOM-{String(room.id).slice(0,4).toUpperCase()}) • {dateLabel} • Room created {roomDate}</span>
                </div>
                <div className="text-[14px] font-semibold mt-2">{room.name} • {l.status} • {l.container_number||"No container"} • {l.vessel_name||l.vessel||"No vessel"} • Products: {products}</div>
                <div className="text-[11px] mt-1 text-neutral-600">{l.departure_port||"Buenaventura"} → {l.arrival_port||"Rotterdam"} • ETD {l.etd?new Date(l.etd).toLocaleDateString():"-"} - ETA {l.eta?new Date(l.eta).toLocaleDateString():"-"} • Room {room.name} • {products}</div>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
