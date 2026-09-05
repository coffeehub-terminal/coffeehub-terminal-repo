"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
export default function PurchaseOrderButton({ roomId, buyerEmail, offerId, price, purchaseOrder }: any) {
  const [loading, setLoading] = useState(false);
  if (purchaseOrder) return <span className="h-7 px-3 rounded-full bg-[#E6F5E6] text-[#2E7D32] text-[11px] flex items-center border border-[#C8EAC8]">PO {purchaseOrder.status} ✓</span>;
  async function create() {
    if (!buyerEmail) return alert("Buyer email missing");
    setLoading(true);
    try {
      const { data: existing } = await supabase.from("PurchaseOrders").select("id").eq("room_id", roomId).eq("offer_id", offerId).limit(1);
      if (existing && existing.length > 0) { location.reload(); return; }
      const { error } = await supabase.from("PurchaseOrders").insert({ room_id: roomId, buyer_email: buyerEmail, offer_id: offerId, quantity: 1, price: price || 0, status: "Approved" });
      if (error) throw error;
      location.reload();
    } catch (e:any) { alert(e.message); } finally { setLoading(false); }
  }
  return <button onClick={create} disabled={loading} className="h-7 px-3 rounded-full bg-white border border-[#111] text-[11px] font-medium hover:bg-[#111] hover:text-white transition">{loading? "..." : `Buy $${price||0}/kg`}</button>;
}
