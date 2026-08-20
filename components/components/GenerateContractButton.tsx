"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  purchaseOrderId: number;
  roomId: string;
  buyerEmail: string;
};

export default function GenerateContractButton({
  purchaseOrderId,
  roomId,
  buyerEmail,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function generateContract() {
    setLoading(true);

    const { error } = await supabase
      .from("Contracts")
      .insert({
        purchase_order_id: purchaseOrderId,
        room_id: roomId,
        buyer_email: buyerEmail,
        status: "Draft",
        contract_number: `CT-${purchaseOrderId}`,
      });

    setLoading(false);

    if (!error) {
      setDone(true);
    } else {
      alert(error.message);
    }
  }

  if (done) {
    return (
      <div className="bg-green-600 text-white px-4 py-2 rounded font-bold">
        ✓ Contract Generated
      </div>
    );
  }

  return (
    <button
      onClick={generateContract}
      disabled={loading}
      className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700"
    >
      {loading ? "Generating..." : "Generate Contract"}
    </button>
  );
}