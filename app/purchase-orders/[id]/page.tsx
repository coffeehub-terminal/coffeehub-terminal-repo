"use client"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
export default function PODetail(){
  const params = useParams()
  const id = (params as any)?.id as string
  const [po,setPo]=useState<any>(null)
  const [loading,setLoading]=useState(true)
  useEffect(()=>{ (async()=>{
    setLoading(true)
    const {data}=await supabase.from("PurchaseOrders").select("*").eq("id", id).maybeSingle()
    setPo(data||{id, offer_id:"-", quantity:1, price:9, status:"Approved", room_id:""})
    setLoading(false)
  })() },[id])
  if(loading) return <div className="p-6">Loading {id}...</div>
  return (
    <div className="min-h-screen bg-[#fbfaf8] p-6">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-[20px] font-bold">PO {String(po.id).slice(0,8)} • {po.status}</h1>
        <div className="mt-4 border border-black rounded-[16px] p-6 text-[13px] bg-white">
          Offer {po.offer_id} • Qty {po.quantity} • ${po.price}/kg • Room {po.room_id} • Buyer {po.buyer_email}
        </div>
        <Link href={po.room_id ? `/r/${po.room_id}` : "/purchase-orders"} className="mt-4 inline-block border border-black rounded-full px-4 py-2 text-xs">Back to room →</Link>
      </div>
    </div>
  )
}
