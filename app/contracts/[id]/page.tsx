"use client"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
export default function ContractDetail(){
  const params = useParams()
  const id = (params as any)?.id as string
  const [c,setC]=useState<any>(null)
  const [loading,setLoading]=useState(true)
  useEffect(()=>{ (async()=>{
    setLoading(true)
    let found:any=null
    try{ const {data}=await supabase.from("Contracts").select("*").eq("id", id).maybeSingle(); if(data) found=data }catch{}
    if(!found){ try{ const {data}=await supabase.from("Contracts").select("*").eq("contract_number", id).maybeSingle(); if(data) found=data }catch{} }
    if(!found){ found={ id, contract_number: id, status:"Draft", price:9, incoterm:"FOB", payment_terms:"100% before", shipment_window:"30 DAYS", is_mock:true } }
    setC(found); setLoading(false)
  })() },[id])
  if(loading) return <div className="min-h-screen flex items-center justify-center">Loading {id}...</div>
  return (
    <div className="min-h-screen bg-[#fbfaf8] p-6">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-[20px] font-bold">{c.contract_number||c.id} • {c.status} {c.is_mock?"(mock - will create on edit in /contracts)":""}</h1>
        <div className="mt-4 border border-black rounded-[16px] p-6 text-[13px] bg-white">
          <div>Contract: {c.contract_number}</div>
          <div>Status: {c.status}</div>
          <div>Price: ${c.price}</div>
          <div>Incoterm: {c.incoterm}</div>
          <div>Shipment: {c.shipment_window}</div>
          <div>Payment: {c.payment_terms}</div>
          <div className="mt-2">Conditions: {c.special_conditions||"-"}</div>
          <div className="mt-2 text-[11px] text-neutral-500">PO {c.purchase_order_id} • Room {c.room_id} • Buyer {c.buyer_email}</div>
        </div>
        <Link href={c.room_id ? `/r/${c.room_id}` : "/contracts"} className="mt-4 inline-block border border-black rounded-full px-4 py-2 text-xs">Back →</Link>
      </div>
    </div>
  )
}
