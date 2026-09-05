"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

type Lot = any; type Offer = any; type Room = any;

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<"inventory"|"offers"|"rooms">("inventory");
  const [lots, setLots] = useState<Lot[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showLotForm, setShowLotForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [selectedOfferIds, setSelectedOfferIds] = useState<string[]>([]);
  const [participantEmail, setParticipantEmail] = useState("");
  const [copied, setCopied] = useState("");
  const [newLot, setNewLot] = useState({ Company:"CoffeeHub", lot_number:"", origin:"", process:"Washed", score:"", price_per_kg:"", variety:"", altitude:"", farm:"", producer:"", cup_notes:"", required_bags:"10" });

  useEffect(()=>{ loadAll(); },[]);
  const loadAll = async()=>{
    const [{ data: lotsData }, { data: offersData }, { data: roomsData }] = await Promise.all([
      supabase.from("Lots").select("*").order("id",{ascending:false}),
      supabase.from("Offers").select("*").order("id",{ascending:false}),
      supabase.from("Rooms").select("*").order("id",{ascending:false})
    ]);
    if(lotsData) setLots(lotsData);
    if(offersData) setOffers(offersData);
    if(roomsData) setRooms(roomsData);
  };

  const createLot = async()=>{
    if(!newLot.lot_number || !newLot.origin || !newLot.price_per_kg) return alert("Lot number, Origin, Price/kg required");
    const price = Number(newLot.price_per_kg);
    const lotPayload:any = {
      lot_number: newLot.lot_number,
      origin: newLot.origin,
      Company: newLot.Company || "CoffeeHub",
      process: newLot.process || "Washed",
      variety: newLot.variety || null,
      farm: newLot.farm || null,
      producer: newLot.producer || null,
      cup_notes: newLot.cup_notes || null,
      altitude: newLot.altitude || null,
      price_per_kg: price,
      fob: price,
    };
    if(newLot.score) lotPayload.score = Number(newLot.score);
    if(newLot.required_bags) lotPayload.required_bags = Number(newLot.required_bags);

    const { error } = await supabase.from("Lots").insert(lotPayload);
    if(error) return alert("Lots: "+error.message);

    // Offer with BOTH price_per_kg and fob and price for backward compat
    const offerId = `OFF-${Date.now()}`;
    const offerPayload:any = {
      id: offerId,
      lot_number: newLot.lot_number,
      origin: newLot.origin,
      company_name: newLot.Company || "CoffeeHub",
      status: "active",
      price_per_kg: price,
      fob: price,
      price: price,
      variety: newLot.variety || null,
      farm: newLot.farm || null,
      process: newLot.process || "Washed",
      score: newLot.score ? Number(newLot.score) : null,
      required_bags: newLot.required_bags ? Number(newLot.required_bags) : null,
      altitude: newLot.altitude || null,
      cup_notes: newLot.cup_notes || null,
    };
    const { error: oErr } = await supabase.from("Offers").insert(offerPayload);
    if(oErr) alert("Offer warn: "+oErr.message);

    setShowLotForm(false);
    setNewLot({ Company:"CoffeeHub", lot_number:"", origin:"", process:"Washed", score:"", price_per_kg:"", variety:"", altitude:"", farm:"", producer:"", cup_notes:"", required_bags:"10" });
    loadAll();
  };

  const createRoom = async()=>{
    if(!newRoomName || selectedOfferIds.length===0) return alert("Room name + at least 1 lot required");
    const id = `ROOM-${Date.now().toString().slice(-6)}`;
    const share_token = crypto.randomUUID(); // UUID for Supabase
    const { error } = await supabase.from("Rooms").insert({ id, name:newRoomName, offer_ids:selectedOfferIds.join(","), status:"Active", share_token });
    if(error) return alert("Rooms: "+error.message);

    if(participantEmail){
      // FIXED: was Participants, now RoomParticipants with correct columns
      const { error: pErr } = await supabase.from("RoomParticipants").insert({ room_id:id, email:participantEmail, role:"guest", status:"invited" });
      if(pErr) console.warn("RoomParticipants:", pErr.message);
    }

    const buyerLink = `${window.location.origin}/r/${share_token}`;
    console.log(`[MOCK EMAIL to ${participantEmail || "buyer"}] You have new coffees in ${newRoomName}: ${buyerLink}`);
    setCopied(buyerLink);
    alert(`Buyer room created!\n${buyerLink}\n\nMock email logged to console`);
    setShowRoomForm(false); setNewRoomName(""); setSelectedOfferIds([]); setParticipantEmail(""); loadAll();
  };

  const getPrice = (o:any) => o.price_per_kg ?? o.fob ?? o.price ?? 0;

  return (
    <main className="min-h-screen bg-[#FBFBF9] text-[#111]">
      <div className="sticky top-0 z-20 bg-white border-b border-[#EAE6E1]">
        <div className="max-w-[1280px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[8px] bg-[#111] text-white flex items-center justify-center font-bold text-[11px]">CH</div>
            <span className="font-semibold text-[14px]">CoffeeHub</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F5F5F5] border border-[#E8E8E8]">Seller • Green OS</span>
          </div>
          <div className="flex gap-2">
            <Link href="/contracts" className="h-8 px-3 rounded-full border border-[#E8E8E8] text-[12px] flex items-center hover:bg-[#111] hover:text-white transition">Contracts</Link>
            <Link href="/purchase-orders" className="h-8 px-3 rounded-full border border-[#E8E8E8] text-[12px] flex items-center hover:bg-[#111] hover:text-white transition">Purchase Orders</Link>
            <Link href="/logistics" className="h-8 px-3 rounded-full border border-[#E8E8E8] text-[12px] flex items-center hover:bg-[#111] hover:text-white transition">Logistics</Link>
            <Link href="/samples" className="h-8 px-3 rounded-full border border-[#E8E8E8] text-[12px] flex items-center hover:bg-[#111] hover:text-white transition">Samples</Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight leading-none">Your green coffee</h1>
            <p className="text-[13px] text-[#777] mt-2 max-w-lg">List it, share a private room, move it. No marketplace fees.</p>
            {copied && <div className="mt-3 text-[11px] bg-[#111] text-white px-3 py-2 rounded-full inline-flex gap-2"><span>Buyer link:</span><span className="truncate max-w-[300px]">{copied}</span></div>}
          </div>
          <div className="flex gap-2">
            <button onClick={()=>setShowLotForm(true)} className="h-9 px-4 rounded-full bg-[#111] text-white text-[13px] font-medium">+ New lot</button>
            <button onClick={()=>setShowRoomForm(true)} className="h-9 px-4 rounded-full bg-white border border-[#E8E8E8] text-[13px] font-medium">+ Buyer room</button>
          </div>
        </div>

        <div className="flex gap-6 border-b border-[#EAE6E1] mb-6">
          {[{ id:"inventory", label:"Inventory", count:lots.length }, { id:"offers", label:"Offers", count:offers.length }, { id:"rooms", label:"Buyer rooms", count:rooms.length }].map((t:any)=>(
            <button key={t.id} onClick={()=>setActiveScreen(t.id)} className={`pb-3 text-[13px] font-medium border-b -mb-px flex items-center gap-1.5 ${activeScreen===t.id? "border-[#111] text-[#111]":"border-transparent text-[#888] hover:text-[#111]"}`}>
              {t.label} <span className={`text-[11px] px-1.5 py-0.5 rounded-md ${activeScreen===t.id? "bg-[#111] text-white":"bg-[#F2F2F2] text-[#777]"}`}>{t.count}</span>
            </button>
          ))}
        </div>

        {activeScreen==="inventory" && (
          <div className="bg-white rounded-[16px] border border-[#E8E8E8] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#F0F0F0] flex justify-between"><span className="text-[12px] font-medium text-[#666]">Lots in warehouse</span><span className="text-[12px] text-[#999]">{lots.length} lots</span></div>
            <div className="divide-y divide-[#F2F2F2]">
              {lots.map((lot:any)=>(
                <Link key={lot.id} href={`/lot/${lot.id}`} className="px-5 py-4 flex items-center justify-between hover:bg-[#FAFAF8]">
                  <div className="flex gap-3 items-center min-w-0">
                    <div className="w-10 h-10 rounded-[10px] bg-[#FBF8F3] border border-[#F0EBE3] flex items-center justify-center">🌿</div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium truncate">{lot.lot_number} • {lot.origin || lot.Company} {lot.score && <span className="ml-2 text-[11px] px-1.5 py-0.5 rounded-full bg-[#E6F5E6] text-[#2E7D32]">{lot.score}</span>}</div>
                      <div className="text-[12px] text-[#888] truncate">{lot.farm || lot.producer || "Farm"} • {lot.variety || "Variety"} • {lot.process || "Washed"} • {lot.required_bags || "?"} bags</div>
                    </div>
                  </div>
                  <div className="text-[13px] font-medium">${lot.price_per_kg ?? lot.fob ?? "—"}/kg</div>
                </Link>
              ))}
              {lots.length===0 && <div className="p-16 text-center"><div className="text-[14px] font-medium">No green coffee yet</div><button onClick={()=>setShowLotForm(true)} className="mt-4 h-8 px-4 rounded-full bg-[#111] text-white text-[12px]">Add lot</button></div>}
            </div>
          </div>
        )}

        {activeScreen==="offers" && (
          <div className="bg-white rounded-[16px] border border-[#E8E8E8] divide-y divide-[#F2F2F2]">
            {offers.map((o:any)=>(<div key={o.id} className="p-5 flex justify-between items-center"><div><div className="text-[13px] font-medium">{o.lot_number} • {o.company_name || o.origin} • ${getPrice(o)}/kg</div><div className="text-[12px] text-[#888]">{o.origin} • {o.id}</div></div><span className={`text-[11px] px-2.5 py-1 rounded-full ${o.status==="active"||o.status==="Active"?"bg-[#E6F5E6] text-[#2E7D32]":"bg-[#F5F5F5] text-[#777]"}`}>{o.status}</span></div>))}
          </div>
        )}

        {activeScreen==="rooms" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {rooms.map((r:any)=>(
              <div key={r.id} className="bg-white rounded-[16px] border border-[#E8E8E8] p-5 hover:border-[#111]/20 transition">
                <div className="flex justify-between"><span className="text-[13px] font-medium">{r.name}</span><span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5F5F5] border">{r.status}</span></div>
                <div className="text-[11px] text-[#888] mt-2">{r.id} • {(r.offer_ids||"").split(",").filter(Boolean).length} lots</div>
                <div className="mt-4 flex gap-2">
                  <button onClick={()=>{ const link=`${window.location.origin}/r/${r.share_token}`; navigator.clipboard.writeText(link); setCopied(link); }} className="h-8 px-3.5 rounded-full bg-[#111] text-white text-[12px]">Copy buyer link</button>
                  <Link href={`/room/${r.id}`} className="h-8 px-3.5 rounded-full border border-[#E8E8E8] text-[12px] flex items-center">Open →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showLotForm && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-[20px] border border-[#E8E8E8] w-full max-w-[560px] p-6 shadow-xl">
            <h2 className="text-[16px] font-semibold">New lot</h2>
            <p className="text-[12px] text-[#888] mt-1">Writes Lots (price_per_kg+fob) + Offers (price_per_kg+fob+price)</p>
            <div className="grid grid-cols-2 gap-3 mt-5">
              <input placeholder="Lot number *" value={newLot.lot_number} onChange={e=>setNewLot({...newLot, lot_number:e.target.value})} className="h-10 px-3.5 rounded-full border border-[#E8E8E8] text-[13px]" />
              <input placeholder="Origin *" value={newLot.origin} onChange={e=>setNewLot({...newLot, origin:e.target.value})} className="h-10 px-3.5 rounded-full border border-[#E8E8E8] text-[13px]" />
              <input placeholder="Company" value={newLot.Company} onChange={e=>setNewLot({...newLot, Company:e.target.value})} className="h-10 px-3.5 rounded-full border border-[#E8E8E8] text-[13px]" />
              <input placeholder="Farm" value={newLot.farm} onChange={e=>setNewLot({...newLot, farm:e.target.value})} className="h-10 px-3.5 rounded-full border border-[#E8E8E8] text-[13px]" />
              <input placeholder="Variety" value={newLot.variety} onChange={e=>setNewLot({...newLot, variety:e.target.value})} className="h-10 px-3.5 rounded-full border border-[#E8E8E8] text-[13px]" />
              <input placeholder="Process" value={newLot.process} onChange={e=>setNewLot({...newLot, process:e.target.value})} className="h-10 px-3.5 rounded-full border border-[#E8E8E8] text-[13px]" />
              <input placeholder="Score" value={newLot.score} onChange={e=>setNewLot({...newLot, score:e.target.value})} className="h-10 px-3.5 rounded-full border border-[#E8E8E8] text-[13px]" />
              <input placeholder="Price/kg *" value={newLot.price_per_kg} onChange={e=>setNewLot({...newLot, price_per_kg:e.target.value})} className="h-10 px-3.5 rounded-full border border-[#E8E8E8] text-[13px]" />
              <input placeholder="Bags" value={newLot.required_bags} onChange={e=>setNewLot({...newLot, required_bags:e.target.value})} className="h-10 px-3.5 rounded-full border border-[#E8E8E8] text-[13px]" />
              <input placeholder="Altitude" value={newLot.altitude} onChange={e=>setNewLot({...newLot, altitude:e.target.value})} className="h-10 px-3.5 rounded-full border border-[#E8E8E8] text-[13px]" />
            </div>
            <textarea placeholder="Cup notes" value={newLot.cup_notes} onChange={e=>setNewLot({...newLot, cup_notes:e.target.value})} className="mt-3 w-full h-20 p-3.5 rounded-[16px] border border-[#E8E8E8] text-[13px]" />
            <div className="mt-5 flex gap-2 justify-end">
              <button onClick={()=>setShowLotForm(false)} className="h-10 px-5 rounded-full border border-[#E8E8E8] text-[13px]">Cancel</button>
              <button onClick={createLot} className="h-10 px-5 rounded-full bg-[#111] text-white text-[13px] font-medium">Create lot + offer</button>
            </div>
          </div>
        </div>
      )}

      {showRoomForm && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-[20px] border border-[#E8E8E8] w-full max-w-[560px] p-6 shadow-xl max-h-[90vh] overflow-auto">
            <h2 className="text-[16px] font-semibold">New buyer room</h2>
            <p className="text-[12px] text-[#888] mt-1">Private link /r/[share_token] + mock email console.log</p>
            <input placeholder="Room name" value={newRoomName} onChange={e=>setNewRoomName(e.target.value)} className="mt-4 w-full h-10 px-3.5 rounded-full border border-[#E8E8E8] text-[13px]" />
            <input placeholder="Buyer email" value={participantEmail} onChange={e=>setParticipantEmail(e.target.value)} className="mt-3 w-full h-10 px-3.5 rounded-full border border-[#E8E8E8] text-[13px]" />
            <div className="mt-4 rounded-[12px] border border-[#F0F0F0] divide-y divide-[#F2F2F2] max-h-64 overflow-auto">
              <div className="px-3 py-2 text-[11px] text-[#888] uppercase sticky top-0 bg-white">Select Offers.id</div>
              {offers.map((off:any)=>(
                <label key={off.id} className="flex items-center gap-2.5 p-3 hover:bg-[#FAFAF8] cursor-pointer">
                  <input type="checkbox" checked={selectedOfferIds.includes(off.id)} onChange={e=>{
                    if(e.target.checked) setSelectedOfferIds([...selectedOfferIds, off.id]);
                    else setSelectedOfferIds(selectedOfferIds.filter(id=>id!==off.id));
                  }} />
                  <span className="text-[13px] flex-1">{off.lot_number} • {off.origin} • ${getPrice(off)}/kg • {off.id.slice(0,14)}</span>
                </label>
              ))}
            </div>
            <div className="mt-5 flex gap-2 justify-end">
              <button onClick={()=>setShowRoomForm(false)} className="h-10 px-5 rounded-full border border-[#E8E8E8] text-[13px]">Cancel</button>
              <button onClick={createRoom} className="h-10 px-5 rounded-full bg-[#111] text-white text-[13px]">Create room + email</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
