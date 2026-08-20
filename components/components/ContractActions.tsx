"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  contractId: number;
  status: string;
};

export default function ContractActions({
  contractId,
  status,
}: Props) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    setLoading(true);

    const { error } = await supabase
      .from("Contracts")
      .update({
        status: newStatus,
      })
      .eq("id", contractId);

    setLoading(false);

    if (!error) {
      setCurrentStatus(newStatus);
    } else {
      alert(error.message);
    }
  }

  if (currentStatus === "Draft") {
    return (
      <button
        onClick={() => updateStatus("Sent")}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded font-bold"
      >
        {loading ? "Sending..." : "Send To Buyer"}
      </button>
    );
  }

  return (
    <div className="font-bold text-green-400">
      {currentStatus}
    </div>
  );
}