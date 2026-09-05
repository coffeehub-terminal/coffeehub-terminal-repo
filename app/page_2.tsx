"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";
export default function Home(){
  const [activeScreen,setActiveScreen]=useState("inventory");
  const [lots,setLots]=useState<any[]>([]);
  const [offers,setOffers]=useState<any[]>([]);
  const [rooms,setRooms]=useState<any[]>([]);
  const [showLotForm,setShowLotForm]=useState(false);
  const [showRoomForm,setShowRoomForm]=useState(false);
  const [newRoomName,setNewRoomName]=useState("");
  const [selectedOfferIds,setSelectedOfferIds]=useState<string[]>([]);
  const [participantEmail,setParticipantEmail]=useState("");
  const [copied,setCopied]=useState("");
  const [pendingSamples,setPendingSamples]=useState(0);
  const [pendingPOs,setPendingPOs]=useState(0);
  const [pendingContracts,setPendingContracts]=useState(0);
  const [newLot,setNewLot]=useState({Company:"CoffeeHub",lot_number:"",origin:"",process:"Washed",score:"",price_per_kg:"",variety:"",altitude:"",farm:"",producer:"",cup_notes:"",required_bags:"10"});
  const loadAll=async()=>{
    const [{data:lotsData},{data:offersData},{data:roomsData}]=await Promise.all([supabase.from("Lots").select("*").order("id",{ascending:false}),supabase.from("Offers").select("*").order("id",{ascending:false}),supabase.from("Rooms").select("*").order("id",{ascending:false})]);
    if(lotsData) setLots(lotsData); if(offersData) setOffers(offersData); if(roomsData) setRooms(roomsData);
    const {data:p1}=await supabase.from("Samples").select("id").in("status",["Requested","Preparing"]).limit(100); if(p1) setPendingSamples(p1.length);
    const {data:p2}=await supabase.from("PurchaseOrders").select("id").eq("status","Pending").limit(100); if(p2) setPendingPOs(p2.length);
    const {data:p3}=await supabase.from("Contracts").select("id").eq("status","Draft").limit(100); if(p3) setPendingContracts(p3.length);
  };
  useEffect(()=>{loadAll();},[]);
  const createLot=async()=>{
    if(!newLot.lot_number||!newLot.origin||!newLot.price_per_kg) return alert("Lot, Origin, Price required");
    const price=Number(newLot.price_per_kg);
    const {error}=await supabase.from("Lots").insert({lot_number:newLot.lot_number,origin:newLot.origin,Company:newLot.Company,process:newLot.process,variety:newLot.variety||null,farm:newLot.farm||null,producer:newLot.producer||null,cup_notes:newLot.cup_notes||null,altitude:newLot.altitude||null,price_per_kg:price,fob:price,score:newLot.score?Number(newLot.score):null,required_bags:newLot.required_bags?Number(newLot.required_bags):null});
    if(error) return alert(error.message);
    await supabase.from("Offers").insert({id:`OFF-${Date.now()}`,lot_number:newLot.lot_number,origin:newLot.origin,company_name:newLot.Company,status:"active",price_per_kg:price,fob:price,price:price,variety:newLot.variety||null,farm:newLot.farm||null,process:newLot.process,score:newLot.score?Number(newLot.score):null,required_bags:newLot.required_bags?Number(newLot.required_bags):null,altitude:newLot.altitude||null,cup_notes:newLot.cup_notes||null});
    setShowLotForm(false); setNewLot({Company:"CoffeeHub",lot_number:"",origin:"",process:"Washed",score:"",price_per_kg:"",variety:"",altitude:"",farm:"",producer:"",cup_notes:"",required_bags:"10"}); loadAll();
  };
  const createRoom=async()=>{
    if(!newRoomName||selectedOfferIds.length===0) return alert("Room name + lot required");
    const id=`ROOM-${Date.now().toString().slice(-6)}`; const share_token=crypto.randomUUID();
    await supabase.from("Rooms").insert({id,name:newRoomName,offer_ids:selectedOfferIds.join(","),status:"Active",share_token});
    if(participantEmail) await supabase.from("RoomParticipants").insert({room_id:id,email:participantEmail,role:"guest",status:"invited"});
    const buyerLink=`https://app.coffeehubcolombia.com/r/${share_token}`; setCopied(buyerLink); alert(`Room: ${buyerLink}`); setShowRoomForm(false); setNewRoomName(""); setSelectedOfferIds([]); setParticipantEmail(""); loadAll();
  };
  const getPrice=(o:any)=>o.price_per_kg??o.fob??o.price??0;
  return <main className="min-h-screen bg-[#FBFBF9] text-[#111]">
    <div className="sticky top-0 z-20 bg-white border-b border-[#EAE6E1]"><div className="max-w-[1280px] mx-auto px-6 h-14 flex items-center justify-between">
      <div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-[8px] bg-[#111] text-white flex items-center justify-center font-bold text-[11px]">CH</div><span className="font-semibold text-[14px]">CoffeeHub</span><span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F5F5F5] border border-[#E8E8E8]">Seller • Green OS</span></div>
      <div className="flex gap-2">
        <Link href="/samples" className="h-8 px-3 rounded-full border border-[#E8E8E8] text-[12px] flex items-center hover:bg-[#111] hover:text-white transition">Samples {pendingSamples>0&&<span className="ml-1.5 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingSamples}</span>}</Link>
        <Link href="/purchase-orders" className="h-8 px-3 rounded-full border border-[#E8E8E8] text-[12px] flex items-center hover:bg-[#111] hover:text-white transition bg-[#FFF7ED] border-amber-200">POs {pendingPOs>0&&<span className="ml-1.5 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingPOs}</span>}</Link>
        <Link href="/contracts" className="h-8 px-3 rounded-full border border-[#E8E8E8] text-[12px] flex items-center hover:bg-[#111] hover:text-white transition bg-[#F0F9FF] border-blue-200">Contracts {pendingContracts>0&&<span className="ml-1.5 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingContracts}</span>}</Link>
        <Link href="/logistics" className="h-8 px-3 rounded-full border border-[#E8E8E8] text-[12px] flex items-center hover:bg-[#111] hover:text-white transition">Logistics</Link>
      </div>
    </div></div>
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      <div className="flex justify-between gap-4 mb-8"><div><h1 className="text-[28px] font-semibold leading-none">Your green coffee</h1><p className="text-[13px] text-[#777] mt-2">List it, share a private room, move it.</p>{copied&&<div className="mt-3 text-[11px] bg-[#111] text-white px-3 py-2 rounded-full">{copied}</div>}</div><div className="flex gap-2"><button onClick={()=>setShowLotForm(true)} className="h-9 px-4 rounded-full bg-[#111] text-white text-[13px]">+ New lot</button><button onClick={()=>setShowRoomForm(true)} className="h-9 px-4 rounded-full bg-white border border-[#E8E8E8] text-[13px]">+ Buyer room</button></div></div>
      <div className="flex gap-6 border-b border-[#EAE6E1] mb-6">{[{id:"inventory",label:"Inventory",count:lots.length},{id:"offers",label:"Offers",count:offers.length},{id:"rooms",label:"Buyer rooms",count:rooms.length}].map((t:any)=>(<button key={t.id} onClick={()=>setActiveScreen(t.id)} className={`pb-3 text-[13px] font-medium border-b -mb-px flex items-center gap-1.5 ${activeScreen===t.id?"border-[#111] text-[#111]":"border-transparent text-[#888]"}`}>{t.label} <span className={`text-[11px] px-1.5 py-0.5 rounded-md ${activeScreen===t.id?"bg-[#111] text-white":"bg-[#F2F2F2]"}`}>{t.count}</span></button>))}</div>
      {activeScreen==="inventory"&&<div className="bg-white rounded-[16px] border overflow-hidden divide-y">{lots.map((lot:any)=>(<Link key={lot.id} href={`/lot/${lot.id}`} className="px-5 py-4 flex justify-between hover:bg-[#FAFAF8]"><div><div className="text-[13px] font-medium">{lot.lot_number} • {lot.origin}</div><div className="text-[12px] text-[#888]">{lot.farm||""} • {lot.required_bags||"?"} bags</div></div><div className="text-[13px]">${lot.price_per_kg??lot.fob??"—"}/kg</div></Link>))}</div>}
      {activeScreen==="offers"&&<div className="bg-white rounded-[16px] border divide-y">{offers.map((o:any)=>(<div key={o.id} className="p-5 flex justify-between"><div className="text-[13px]">{o.lot_number} • {o.origin} • ${getPrice(o)}/kg</div><span className="text-[11px] bg-[#E6F5E6] px-2 py-1 rounded-full">{o.status}</span></div>))}</div>}
      {activeScreen==="rooms"&&<div className="grid md:grid-cols-3 gap-3">{rooms.map((r:any)=>(<div key={r.id} className="bg-white rounded-[16px] border p-5"><div className="text-[13px] font-medium">{r.name}</div><div className="text-[11px] text-[#888] mt-1">{r.id}</div><div className="mt-3 flex gap-2"><button onClick={()=>{const l=`https://app.coffeehubcolombia.com/r/${r.share_token}`; navigator.clipboard.writeText(l); setCopied(l);}} className="h-8 px-3 rounded-full bg-[#111] text-white text-[12px]">Copy</button><Link href={`/room/${r.id}`} className="h-8 px-3 rounded-full border text-[12px] flex items-center">Open →</Link></div></div>))}</div>}
    </div>
    {showLotForm&&<div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center p-6"><div className="bg-white rounded-[20px] border w-full max-w-[560px] p-6"><h2 className="font-semibold">New lot</h2><div className="grid grid-cols-2 gap-3 mt-4"><input placeholder="Lot *" value={newLot.lot_number} onChange={e=>setNewLot({...newLot,lot_number:e.target.value})} className="h-10 px-3 rounded-full border text-[13px]" /><input placeholder="Origin *" value={newLot.origin} onChange={e=>setNewLot({...newLot,origin:e.target.value})} className="h-10 px-3 rounded-full border text-[13px]" /><input placeholder="Price/kg *" value={newLot.price_per_kg} onChange={e=>setNewLot({...newLot,price_per_kg:e.target.value})} className="h-10 px-3 rounded-full border text-[13px]" /></div><div className="mt-4 flex justify-end gap-2"><button onClick={()=>setShowLotForm(false)} className="h-10 px-5 rounded-full border">Cancel</button><button onClick={createLot} className="h-10 px-5 rounded-full bg-black text-white">Create</button></div></div></div>}
    {showRoomForm&&<div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center p-6"><div className="bg-white rounded-[20px] border w-full max-w-[560px] p-6"><h2 className="font-semibold">New room</h2><input placeholder="Room name" value={newRoomName} onChange={e=>setNewRoomName(e.target.value)} className="mt-4 w-full h-10 px-3 rounded-full border text-[13px]" /><input placeholder="Buyer email" value={participantEmail} onChange={e=>setParticipantEmail(e.target.value)} className="mt-3 w-full h-10 px-3 rounded-full border text-[13px]" /><div className="mt-4 border rounded-[12px] max-h-60 overflow-auto divide-y">{offers.map((o:any)=>(<label key={o.id} className="flex gap-2 p-3 text-[13px]"><input type="checkbox" checked={selectedOfferIds.includes(o.id)} onChange={e=>{if(e.target.checked) setSelectedOfferIds([...selectedOfferIds,o.id]); else setSelectedOfferIds(selectedOfferIds.filter(id=>id!==o.id));}} />{o.lot_number} • ${getPrice(o)}/kg</label>))}</div><div className="mt-4 flex justify-end gap-2"><button onClick={()=>setShowRoomForm(false)} className="h-10 px-5 rounded-full border">Cancel</button><button onClick={createRoom} className="h-10 px-5 rounded-full bg-black text-white">Create</button></div></div></div>}
  </main>
}
