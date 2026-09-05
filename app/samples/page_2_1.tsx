"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function SamplesPage(){
  const [rows,setRows]=useState<any[]>([]);
  const [rooms,setRooms]=useState<any>({});
  const [selected,setSelected]=useState<any>(null);
  const [courier,setCourier]=useState("");
  const [tracking,setTracking]=useState("");
  const [status,setStatus]=useState("Requested");
  const [saving,setSaving]=useState(false);

  const load = async()=>{
    const {data} = await supabase.from("Samples").select("*").order("created_at",{ascending:false}).limit(100);
    if(data){
      setRows(data);
      const roomIds = [...new Set(data.map((r:any)=>r.room_id))];
      if(roomIds.length){
        const {data: roomData} = await supabase.from("Rooms").select("*").in("id", roomIds);
        const map:any={}; roomData?.forEach((r:any)=> map[r.id]=r);
        const {data: parts} = await supabase.from("RoomParticipants").select("*").in("room_id", roomIds);
        parts?.forEach((p:any)=>{ if(map[p.room_id]) map[p.room_id].buyer_email = p.email; });
        setRooms(map);
      }
    }
  };
  useEffect(()=>{ load(); },[]);

  const openSample = (s:any)=>{
    setSelected(s);
    setCourier(s.courier||"");
    setTracking(s.tracking_number||"");
    setStatus(s.status||"Requested");
  };

  const save = async()=>{
    if(!selected) return;
    setSaving(true);
    try{
      const { error } = await supabase.from("Samples").update({ courier, tracking_number: tracking, status }).eq("id", selected.id);
      if(error) throw error;
      try{
        await supabase.from("Activities").insert({
          entity_type: "SampleRequest",
          entity_id: selected.sample_request_id||selected.id,
          room_id: selected.room_id,
          action: status,
          title: `Sample ${status}`,
          description: `Courier: ${courier||"-"} Tracking: ${tracking||"-"}`,
          link: `/r/${rooms[selected.room_id]?.share_token||""}`
        });
      }catch{}
      setSelected(null);
      load();
    }catch(e:any){ alert(e.message); } finally{ setSaving(false); }
  };

  const steps = ["Requested","Preparing","Shipped","Delivered"];

  return <main className="min-h-screen bg-[#FBFBF9] text-[#111]">
    <div className="max-w-[1080px] mx-auto p-6">
      <div className="flex justify-between items-center"><Link href="/" className="text-[12px] border bg-white px-3 py-1.5 rounded-full">← Seller OS</Link><h1 className="text-[16px] font-semibold">Samples • {rows.length}</h1></div>
      <p className="text-[12px] text-[#666] mt-2">Click a sample to see progress + update courier/tracking. Buyer sees update live.</p>
      
      <div className="mt-6 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border rounded-[16px] divide-y">
          {rows.map((s:any)=>{
            const room = rooms[s.room_id];
            const isNew = s.status==="Requested";
            const isActive = selected?.id===s.id;
            return <div key={s.id} onClick={()=>openSample(s)} className={`p-4 cursor-pointer hover:bg-[#FAFAF8] flex justify-between items-center ${isActive?"bg-[#111] text-white":""} ${isNew && !isActive?"bg-[#FFFBEB]":""}`}>
              <div>
                <div className={`text-[13px] font-medium ${isActive?"text-white":""}`}>{s.id.slice(0,8)} • {room?.name||s.room_id} {isNew && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500 text-white">New</span>}</div>
                <div className={`text-[11px] mt-1 ${isActive?"text-white/60":"text-[#888]"}`}>{s.buyer_email||room?.buyer_email||"-"} • {new Date(s.created_at).toLocaleDateString()} • {s.courier||"-"} {s.tracking_number?`• ${s.tracking_number}`:""}</div>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full border ${isActive?"bg-white text-black": s.status==="Shipped"?"bg-green-50 text-green-700 border-green-200": s.status==="Requested"?"bg-amber-50 text-amber-700 border-amber-200":"bg-gray-50"}`}>{s.status}</span>
            </div>
          })}
          {rows.length===0&&<div className="p-12 text-center text-[12px] text-[#999]">No samples yet — buyer requests will appear here</div>}
        </div>

        <div className="bg-white border rounded-[16px] p-5 h-fit sticky top-6">
          {!selected ? <div className="text-[12px] text-[#999] text-center py-10">← Select a sample to see progress</div> : (
            <div>
              <div className="flex justify-between items-start"><h3 className="font-semibold text-[14px]">{selected.id.slice(0,8)} • {rooms[selected.room_id]?.name||selected.room_id}</h3><button onClick={()=>setSelected(null)} className="text-[11px] border px-2 py-1 rounded-full">x</button></div>
              <div className="text-[11px] text-[#666] mt-1">{selected.buyer_email} • Room {selected.room_id}</div>
              
              <div className="mt-5">
                <div className="text-[11px] font-medium uppercase tracking-wide text-[#888]">Progress</div>
                <div className="mt-3 space-y-2">
                  {steps.map((st, i)=>{
                    const currentIdx = steps.indexOf(status);
                    const done = i <= steps.indexOf(selected.status) || (status===st && true);
                    const active = status===st;
                    return <div key={st} className="flex gap-3 items-center"><div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${i <= steps.indexOf(selected.status)?"bg-black text-white": i===currentIdx?"bg-amber-500 text-white":"bg-[#F0F0F0] text-[#999]"}`}>{i+1}</div><span className={`text-[12px] ${active?"font-semibold":""}`}>{st}</span>{selected.status===st && <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-black text-white">current</span>}</div>
                  })}
                </div>
                <div className="flex gap-1.5 mt-4">{steps.map((s,i)=><div key={s} className={`flex-1 h-1.5 rounded-full ${i<=steps.indexOf(selected.status)?"bg-black":"bg-[#EAE6E1]"}`} />)}</div>
              </div>

              <div className="mt-6 space-y-3">
                <div><label className="text-[11px] text-[#666]">Status</label><select value={status} onChange={e=>setStatus(e.target.value)} className="mt-1 w-full h-9 border rounded-full px-3 text-[13px]"><option>Requested</option><option>Preparing</option><option>Shipped</option><option>Delivered</option></select></div>
                <div><label className="text-[11px] text-[#666]">Courier</label><input value={courier} onChange={e=>setCourier(e.target.value)} placeholder="DHL, FedEx..." className="mt-1 w-full h-9 border rounded-full px-3 text-[13px]" /></div>
                <div><label className="text-[11px] text-[#666]">Tracking #</label><input value={tracking} onChange={e=>setTracking(e.target.value)} placeholder="1234 5678" className="mt-1 w-full h-9 border rounded-full px-3 text-[13px] font-mono" /></div>
                <button onClick={save} disabled={saving} className="w-full h-10 rounded-full bg-black text-white text-[13px] font-medium mt-2">{saving?"Saving...":"Save — Buyer sees update instantly"}</button>
                <Link href={`/room/${selected.room_id}`} className="block text-center h-9 leading-9 rounded-full border text-[12px] mt-2">Open Buyer Room →</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </main>;
}
