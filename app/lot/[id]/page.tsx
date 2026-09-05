"use client"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function LotDetail(){
  const {id} = useParams() as any
  const [lot,setLot]=useState<any>(null)
  const [offer,setOffer]=useState<any>(null)
  const [status,setStatus]=useState("Loading...")

  useEffect(()=>{
    if(!id) return
    const load=async()=>{
      setStatus("Loading...")
      // 1. Try by Lots.id (uuid)
      let {data:lotData} = await supabase.from("Lots").select("*").eq("id",id).maybeSingle()
      // 2. Try by lot_number (e.g. "2", "303", "3500101")
      if(!lotData){
        const {data} = await supabase.from("Lots").select("*").eq("lot_number",id).maybeSingle()
        lotData = data || null
      }
      // 3. Try by Offer id or Offer lot_number
      if(!lotData){
        let {data:offById} = await supabase.from("Offers").select("*").eq("id",id).maybeSingle()
        if(!offById){
          const {data:offByLotNum} = await supabase.from("Offers").select("*").eq("lot_number",id).maybeSingle()
          offById = offByLotNum || null
        }
        if(offById){
          setOffer(offById)
          const {data:lotByOffer} = await supabase.from("Lots").select("*").eq("lot_number",offById.lot_number).maybeSingle()
          lotData = lotByOffer || null
          if(!lotData){
            // If no Lot, use Offer as lot
            setLot({
              id: offById.id,
              lot_number: offById.lot_number,
              origin: offById.origin,
              price_per_kg: offById.price_per_kg,
              farm: offById.farm,
              variety: offById.variety,
              process: offById.process,
              score: offById.score,
              Company: offById.company_name,
              required_bags: offById.required_bags,
              cup_notes: offById.cup_notes,
              created_at: offById.created_at
            })
            setStatus("")
            return
          }
        }
      }
      if(lotData){
        setLot(lotData)
        const {data:off} = await supabase.from("Offers").select("*").eq("lot_number",lotData.lot_number).order("created_at",{ascending:false}).limit(1).maybeSingle()
        if(off) setOffer(off)
        setStatus("")
      } else {
        setStatus(`Lot "${id}" not found. Check Inventory.`)
      }
    }
    load()
  },[id])

  if(status) return <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center"><div className="bg-white border rounded-2xl px-6 py-4 text-sm">{status} <Link href="/" className="ml-2 underline">← Seller OS</Link></div></div>
  if(!lot) return <div className="p-6">Not found</div>

  return (
    <div className="min-h-screen bg-[#fbfaf8]">
      <header className="border-b bg-white h- flex items-center justify-between px-6"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-xs">CH</div><span className="font-semibold">CoffeeHub</span></div><Link href="/" className="px-3 py-1.5 rounded-full border bg-white text-sm">← Back</Link></header>
      <main className="max-w- mx-auto px-6 py-8">
        <div className="flex justify-between items-start">
          <div><h1 className="text-3xl font-bold">{lot.lot_number} • {lot.origin}</h1><p className="text-sm text-neutral-500 mt-1">{lot.farm||"-"} • {lot.variety||"-"} • ${lot.price_per_kg}/kg {offer && <span className="ml-2 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs">{offer.id}</span>}</p></div>
          <div className="text-right"><div className="text- text-neutral-400 tracking-widest">PRICE</div><div className="text-xl font-bold">${lot.price_per_kg}/kg</div></div>
        </div>
        <div className="bg-white rounded-2xl border overflow-hidden mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y">
            <div className="p-4"><div className="text- text-neutral-400">COMPANY</div><div className="text-sm mt-1">{lot.Company||lot.company_name||"-"}</div></div>
            <div className="p-4"><div className="text- text-neutral-400">LOT_REF</div><div className="text-sm mt-1">{lot.lot_reference||"-"}</div></div>
            <div className="p-4"><div className="text- text-neutral-400">SCORE</div><div className="text-sm mt-1">{lot.score||"-"}</div></div>
            <div className="p-4"><div className="text- text-neutral-400">HARVEST</div><div className="text-sm mt-1">{lot.harvest_year||"-"}</div></div>
            <div className="p-4"><div className="text- text-neutral-400">FARM</div><div className="text-sm mt-1">{lot.farm||"-"}</div></div>
            <div className="p-4"><div className="text- text-neutral-400">VARIETY</div><div className="text-sm mt-1">{lot.variety||"-"}</div></div>
            <div className="p-4"><div className="text- text-neutral-400">PROCESS</div><div className="text-sm mt-1">{lot.process||"-"}</div></div>
            <div className="p-4"><div className="text- text-neutral-400">BAGS</div><div className="text-sm mt-1">{lot.required_bags||"-"}</div></div>
            <div className="p-4 col-span-2"><div className="text- text-neutral-400">PRODUCER / ALTITUDE / CERTS</div><div className="text-sm mt-1">{lot.producer||"-"} • {lot.altitude||"-"} masl • {lot.certifications||"-"}</div></div>
            <div className="p-4 col-span-2"><div className="text- text-neutral-400">PHOTO</div><div className="text-xs mt-1 truncate">{lot.photo_url||"-"}</div></div>
          </div>
          <div className="p-4 border-t"><div className="text- text-neutral-400">CUP NOTES</div><div className="bg-[#fbfaf8] border rounded-xl p-3 text-sm mt-2">{lot.cup_notes||"-"}</div></div>
          <div className="p-4 bg-[#fbfaf8] border-t text-xs font-mono">Lot UUID: {lot.id} • Offer: {offer?.id||"none"} • Created: {lot.created_at? new Date(lot.created_at).toLocaleString() : "-"}</div>
        </div>
      </main>
    </div>
  )
}
