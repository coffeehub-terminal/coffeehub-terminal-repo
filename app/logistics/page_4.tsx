"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
export default function LogisticsPage(){
  const [rows,setRows]=useState<any[]>([]);
  useEffect(()=>{(async()=>{const {data}=await supabase.from("Logistics").select("*").order("id",{ascending:false}).limit(100); if(data) setRows(data);})();},[]);
  return <main className="min-h-screen bg-[#FBFBF9] text-[#111]"><div className="max-w-[1080px] mx-auto p-6"><div className="flex justify-between"><Link href="/" className="text-[12px] border bg-white px-3 py-1.5 rounded-full">← Seller OS</Link><h1 className="text-[16px] font-semibold">Logistics • {rows.length}</h1></div><div className="mt-6 bg-white border rounded-[16px] divide-y">{rows.map((l:any)=><div key={l.id} className="p-4 text-[12px] flex justify-between"><span>{l.id} • {l.booking_number||"-"} • {l.container_number||"-"} • {l.container_size||"40FT"}</span><Link href={`/r/any/logistics/${l.id}`} className="border px-2 py-0.5 rounded-full">View</Link></div>)}{rows.length===0&&<div className="p-12 text-center text-[12px] text-[#999]">No logistics yet</div>}</div></div></main>;
}
