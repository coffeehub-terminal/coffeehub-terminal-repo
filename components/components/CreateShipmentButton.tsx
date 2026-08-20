"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Props = {
  contractId: number;
  buyerEmail: string;
};

export default function CreateShipmentButton({
  contractId,
  buyerEmail,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function createShipment() {
    setLoading(true);

    // Check if shipment already exists
    const { data: existing } = await supabase
      .from("Logistics")
      .select("id")
      .eq("contract_id", contractId)
      .maybeSingle();

    if (existing) {
      router.push("/logistics");
      return;
    }

    const { error } = await supabase
      .from("Logistics")
      .insert({
  contract_id: contractId,
  buyer_email: buyerEmail,
  status: "Preparing Shipment",
});

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/logistics");
  }

  return (
    <button
      onClick={createShipment}
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl"
    >
      {loading ? "Creating Shipment..." : "🚚 Create Shipment"}
    </button>
  );
}