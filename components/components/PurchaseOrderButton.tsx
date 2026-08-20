"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  roomId: string;
  buyerEmail: string;
  offerId: string;
  price: number;
  purchaseOrder?: {
    status: string;
  } | null;
};

export default function PurchaseOrderButton({
  roomId,
  buyerEmail,
  offerId,
  price,
  purchaseOrder,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function createPO() {
    setLoading(true);

    const { error } = await supabase
      .from("PurchaseOrders")
      .insert({
        room_id: roomId,
        buyer_email: buyerEmail,
        offer_id: offerId,
        quantity: 1,
        price,
        status: "Pending",
      });

    setLoading(false);

    if (!error) {
      setDone(true);
    } else {
      alert(error.message);
    }
  }

  if (purchaseOrder) {
  return (
    <div className="bg-green-600 text-white px-4 py-2 rounded font-bold">
      {purchaseOrder.status === "Pending" && "Pending Approval"}
      {purchaseOrder.status === "Approved" && "Purchase Approved"}
      {purchaseOrder.status === "Rejected" && "Purchase Rejected"}
    </div>
  );
}

if (done) {
  return (
    <div className="bg-green-600 text-white px-4 py-2 rounded font-bold">
      Pending Approval
    </div>
  );
}

  return (
    <button
      onClick={createPO}
      disabled={loading}
      className="bg-white text-black px-4 py-2 rounded font-bold hover:bg-gray-200"
    >
      {loading ? "Sending..." : "Request Pricing"}
    </button>
  );
}