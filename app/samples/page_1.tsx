"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
export default function SamplesPage(){
  const [rows,setRows]=useState<any[]>([]);
  useEffect(()=>{(async()=>{const {data}=await supabase.from("Samples").select("*").order("created_at",{ascending:false}).limit(100); if(data) setRows(data);})();},[]);
  return <main className="min-h-screen bg-[#FBFBF9] text-[#111]"><div className="max-w-[1080px] mx-auto p-6"><div className="flex justify-between"><Link href="/" className="text-[12px] border bg-white px-3 py-1.5 rounded-full">← Seller OS</Link><h1 className="text-[16px] font-semibold">Samples • {rows.length}</h1></div><div className="mt-6 bg-white border rounded-[16px] divide-y">{rows.map((s:any)=><div key={s.id} className="p-4 text-[12px]">{s.id.slice(0,8)} • {s.room_id} • {s.status} • {s.courier||"-"} • {s.tracking_number||"-"}</div>)}{rows.length===0&&<div className="p-12 text-center text-[12px] text-[#999]">No samples</div>}</div></div></main>;
}
