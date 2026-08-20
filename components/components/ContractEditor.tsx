"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  contractId: number;
  initialPrice: number | "";
  initialIncoterm: string;
  initialShipmentWindow: string;
  initialPaymentTerms: string;
  initialSpecialConditions: string;
};

export default function ContractEditor({
  contractId,
  initialPrice,
  initialIncoterm,
  initialShipmentWindow,
  initialPaymentTerms,
  initialSpecialConditions,
}: Props) {

  const [price, setPrice] = useState(
    typeof initialPrice === "number" && initialPrice > 0
      ? initialPrice.toString()
      : ""
  );

  const [incoterm, setIncoterm] = useState(
    initialIncoterm || ""
  );

  const [shipmentWindow, setShipmentWindow] = useState(
    initialShipmentWindow || ""
  );

  const [paymentTerms, setPaymentTerms] = useState(
    initialPaymentTerms || ""
  );

  const [specialConditions, setSpecialConditions] = useState(
    initialSpecialConditions || ""
  );

  const [saving, setSaving] = useState(false);

  async function saveContract() {
    setSaving(true);

    const { error } = await supabase
      .from("Contracts")
      .update({
        price: price.trim() === "" ? null : Number(price),
        incoterm,
        shipment_window: shipmentWindow,
        payment_terms: paymentTerms,
        special_conditions: specialConditions,
      })
      .eq("id", contractId);

    setSaving(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Contract saved.");
    }
  }

  return (
    <div className="bg-black rounded-xl p-6 mt-8">

      <h2 className="text-2xl font-bold mb-6">
        Edit Commercial Terms
      </h2>

      <div className="space-y-4">

        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price (USD/kg)"
          className="w-full bg-[#10231e] rounded p-3"
        />

        <input
          value={incoterm}
          onChange={(e) => setIncoterm(e.target.value)}
          placeholder="Incoterm"
          className="w-full bg-[#10231e] rounded p-3"
        />

        <input
          value={shipmentWindow}
          onChange={(e) => setShipmentWindow(e.target.value)}
          placeholder="Shipment Window"
          className="w-full bg-[#10231e] rounded p-3"
        />

        <textarea
          value={paymentTerms}
          onChange={(e) => setPaymentTerms(e.target.value)}
          placeholder="Payment Terms"
          className="w-full bg-[#10231e] rounded p-3"
        />

        <textarea
          value={specialConditions}
          onChange={(e) => setSpecialConditions(e.target.value)}
          placeholder="Special Conditions"
          className="w-full bg-[#10231e] rounded p-3"
        />

        <button
          onClick={saveContract}
          disabled={saving}
          className="bg-green-600 px-6 py-3 rounded font-bold text-white hover:bg-green-700"
        >
          {saving ? "Saving..." : "Save Contract"}
        </button>

      </div>

    </div>
  );
}