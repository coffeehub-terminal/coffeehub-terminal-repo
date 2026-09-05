"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
export default function SamplesPage(){
  const [samples,setSamples]=useState<any[]>([])
  const [selected,setSelected]=useState<any>(null)
  const [form,setForm]=useState({courier:"",tracking_number:"",status:"Preparing",notes:"",shipped_at:"",delivered_at:""})
  useEffect(()=>{(async()=>{ const {data}=await supabase.from("Samples").select("*").order("created_at",{ascending:false}).limit(100); setSamples(data||[]) })()},[])
  const save=async()=>{
    if(!selected) return
    await supabase.from("Samples").update({...form}).eq("id",selected.id)
    const {data}=await supabase.from("Samples").select("*").order("created_at",{ascending:false}).limit(100); setSamples(data||[])
    alert(`Saved - buyer in ${selected.room_id} will see green bar move to ${form.status}`)
  }
  return (
    <div className="min-h-screen bg-white"><div className="border-b px-6 h- flex items-center justify-between"><Link href="/" className="px-4 py-1.5 rounded-full border text-sm">← Seller OS</Link><span className="font-semibold">Samples • {samples.length} {samples.filter(s=>new Date(s.created_at)>new Date(Date.now()-86400000)).length>0 && <span className="ml-2 px-2 py-0.5 bg-green-500 text-white rounded-full text-xs">+{samples.filter(s=>new Date(s.created_at)>new Date(Date.now()-86400000)).length} new</span>}</span><span className="text-xs text-neutral-400">Email / Lot ref + Room</span></div>
      <div className="grid grid-cols-2 h-[calc(100vh-56px)]">
        <div className="border-r overflow-auto">
          {samples.map((s:any)=>(
            <div key={String(s.id)} onClick={()=>{setSelected(s); setForm({courier:s.courier||"",tracking_number:s.tracking_number||"",status:s.status||"Preparing",notes:s.notes||"",shipped_at:s.shipped_at||"",delivered_at:s.delivered_at||""})}} className={`px-6 py-4 border-b cursor-pointer transition-all ${selected?.id===s.id? "bg-black text-white" : "hover:bg-[#fbfaf8] active:bg-black active:text-white"}`}>
              <div className="text-sm font-medium">{s.buyer_email} • {s.room_id} • {String(s.id).slice(0,8)}</div>
              <div className="text-xs mt-1 opacity-70">{s.courier||"-"} {s.tracking_number||""} • {new Date(s.created_at).toLocaleDateString()} • <span className={`px-2 py-0.5 rounded-full border text-xs ${selected?.id===s.id? "bg-white text-black" : "bg-[#fbfaf8]"}`}>{s.status}</span></div>
            </div>
          ))}
        </div>
        <div className="p-6 overflow-auto">
          {selected? (
            <div className="border rounded-2xl p-5 space-y-4">
              <div><h3 className="font-semibold">{String(selected.id).slice(0,8)} • {selected.buyer_email} • {selected.room_id}</h3><p className="text-xs text-neutral-400 mt-1">Room: {selected.room_id} • SampleReq: {String(selected.sample_request_id).slice(0,8)}</p></div>
              <div className="space-y-3">
                <label className="text-xs">Status - drives buyer green bar</label>
                <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="w-full border rounded-full px-4 py-2.5 text-sm bg-white">
                  <option>Preparing</option><option>Shipped</option><option>Delivered</option><option>Approved</option>
                </select>
                <input placeholder="Courier - DHL" value={form.courier} onChange={e=>setForm({...form,courier:e.target.value})} className="w-full border rounded-full px-4 py-2.5 text-sm"/>
                <input placeholder="Tracking - 335 30303" value={form.tracking_number} onChange={e=>setForm({...form,tracking_number:e.target.value})} className="w-full border rounded-full px-4 py-2.5 text-sm"/>
                <input type="date" value={form.shipped_at} onChange={e=>setForm({...form,shipped_at:e.target.value})} className="w-full border rounded-full px-4 py-2.5 text-sm"/>
                <input type="date" value={form.delivered_at} onChange={e=>setForm({...form,delivered_at:e.target.value})} className="w-full border rounded-full px-4 py-2.5 text-sm"/>
                <textarea placeholder="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} className="w-full border rounded-2xl px-4 py-3 text-sm h-20"/>
                <button onClick={save} className="w-full py-3 rounded-full bg-black text-white text-sm font-medium hover:bg-neutral-800 active:scale-[0.98] transition-all">Save - buyer sees green bar move</button>
                <div className="text- text-neutral-400 text-center">This updates buyer portal instantly via Realtime</div>
              </div>
            </div>
          ) : <div className="text-sm text-neutral-400 p-6 border rounded-2xl border-dashed text-center">← Click a sample - black = selected, reactive</div>}
        </div>
      </div>
    </div>
  )
}
