"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SampleOrdersTable() {
  const [samples, setSamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSamples();
  }, []);

  async function loadSamples() {
    const { data, error } = await supabase
      .from("Samples")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setSamples(data || []);
    setLoading(false);
  }

  function updateField(
    id: string,
    field: string,
    value: string
  ) {
    setSamples((current) =>
      current.map((sample) =>
        sample.id === id
          ? {
              ...sample,
              [field]: value,
            }
          : sample
      )
    );
  }

  async function saveShipment(id: string) {
    const sample = samples.find((s) => s.id === id);

    if (!sample) return;

    const { error } = await supabase
      .from("Samples")
      .update({
        courier: sample.courier,
        tracking_number: sample.tracking_number,
        status: "Shipped",
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Shipment saved.");

    loadSamples();
  }

  if (loading) {
    return (
      <div className="text-gray-400">
        Loading...
      </div>
    );
  }

  if (samples.length === 0) {
    return (
      <div className="text-center text-gray-400 py-20">
        No sample orders yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {samples.map((sample) => (
        <div
          key={sample.id}
          className="bg-black rounded-xl p-6"
        >
          <div className="text-xl font-bold mb-2">
            {sample.buyer_email}
          </div>

          <div className="text-green-400 mb-4">
            {sample.status}
          </div>

          <div className="space-y-4">

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Courier
              </label>

              <input
                value={sample.courier || ""}
                onChange={(e) =>
                  updateField(
                    sample.id,
                    "courier",
                    e.target.value
                  )
                }
                placeholder="DHL, FedEx..."
                className="w-full bg-[#10231e] rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Tracking Number
              </label>

              <input
                value={sample.tracking_number || ""}
                onChange={(e) =>
                  updateField(
                    sample.id,
                    "tracking_number",
                    e.target.value
                  )
                }
                placeholder="Tracking Number"
                className="w-full bg-[#10231e] rounded px-3 py-2"
              />
            </div>

            <button
              onClick={() => saveShipment(sample.id)}
              className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded font-bold"
            >
              Save Shipment
            </button>

          </div>
        </div>
      ))}
    </div>
  );
}