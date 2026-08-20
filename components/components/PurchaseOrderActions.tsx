"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface PurchaseOrderActionsProps {
  orderId: number;
  status: string;
}

export default function PurchaseOrderActions({
  orderId,
  status,
}: PurchaseOrderActionsProps) {
  
  const [currentStatus, setCurrentStatus] = useState(status);
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: "Approved" | "Rejected") {
    setLoading(true);

    const { error } = await supabase
      .from("PurchaseOrders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (!error) {
      setCurrentStatus(newStatus);
    }

    setLoading(false);
  }

  if (currentStatus !== "Pending") {
    return (
      <span className="font-medium">
        {currentStatus}
      </span>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        disabled={loading}
        onClick={() => updateStatus("Approved")}
        className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700 disabled:opacity-50"
      >
        Approve
      </button>

      <button
        disabled={loading}
        onClick={() => updateStatus("Rejected")}
        className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}