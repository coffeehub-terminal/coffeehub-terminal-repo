"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { createActivity } from "@/lib/activity";
import { ActivityTypes } from "@/lib/activity-types";

export default function SampleRequestCard({
  request,
}: {
  request: any;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isLocked =
    request.status === "Approved" ||
    request.status === "Rejected";

  async function updateStatus(status: string) {
    if (loading || isLocked) return;

    const confirmed = window.confirm(
      `Are you sure you want to ${status.toLowerCase()} this sample request?`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      // --------------------------------------------------
      // Prevent double processing
      // --------------------------------------------------

      const { data: latestRequest, error: latestError } =
        await supabase
          .from("SampleRequests")
          .select("status")
          .eq("id", request.id)
          .single();

      if (latestError) throw latestError;

      if (
        latestRequest.status === "Approved" ||
        latestRequest.status === "Rejected"
      ) {
        alert("This request has already been processed.");
        router.refresh();
        return;
      }

      // --------------------------------------------------
      // Update Sample Request
      // --------------------------------------------------

      const { error } = await supabase
        .from("SampleRequests")
        .update({ status })
        .eq("id", request.id);

      if (error) throw error;
      

      // --------------------------------------------------
      // Approved
      // --------------------------------------------------

      if (status === "Approved") {
        const { data: existingSample, error: existingError } =
          await supabase
            .from("Samples")
            .select("id")
            .eq("sample_request_id", request.id)
            .limit(1);

        if (existingError) throw existingError;

        if (!existingSample || existingSample.length === 0) {
          const { error: sampleError } = await supabase
            .from("Samples")
            .insert({
              sample_request_id: request.id,
              room_id: request.room_id,
              buyer_email: request.buyer_email,
              status: "Preparing",
            });

          if (sampleError) throw sampleError;
        }

        await createActivity({
          entityType: "SampleRequest",
          entityId: request.id,
          roomId: request.room_id,
          action: ActivityTypes.SAMPLE_APPROVED.action,
          title: ActivityTypes.SAMPLE_APPROVED.title,
          description: `Sample request approved for ${request.buyer_email}.`,
          link: "/sample-requests",
          createdBy: "Exporter",
        });
      }

      // --------------------------------------------------
      // Rejected
      // --------------------------------------------------

      if (status === "Rejected") {
        await createActivity({
          entityType: "SampleRequest",
          entityId: request.id,
          roomId: request.room_id,
          action: ActivityTypes.SAMPLE_REJECTED.action,
          title: ActivityTypes.SAMPLE_REJECTED.title,
          description: `Sample request rejected for ${request.buyer_email}.`,
          link: "/sample-requests",
          createdBy: "Exporter",
        });
      }

      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-black rounded-xl p-6">
      <div className="flex justify-between mb-6">
        <div>
          <div className="text-xl font-bold">
            {request.buyer_email}
          </div>

          <div className="text-green-400">
            {request.status}
          </div>
        </div>

        <div className="text-gray-500">
          {new Date(request.created_at).toLocaleString()}
        </div>
      </div>

      <div className="mb-6">
        <div className="font-bold mb-2">
          Requested Coffees
        </div>

        {request.SampleRequestOffers?.map((item: any) => (
          <div key={item.offer_id}>
            ☕ {item.Offers?.lot_number} — {item.Offers?.origin}
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => updateStatus("Approved")}
          disabled={loading || isLocked}
          className={`px-4 py-2 rounded font-bold ${
            loading || isLocked
              ? "bg-gray-600 text-white cursor-not-allowed"
              : "bg-green-500 text-black"
          }`}
        >
          {request.status === "Approved"
            ? "Approved"
            : "Approve"}
        </button>

        <button
          onClick={() => updateStatus("Rejected")}
          disabled={loading || isLocked}
          className={`px-4 py-2 rounded font-bold ${
            loading || isLocked
              ? "bg-gray-600 text-white cursor-not-allowed"
              : "bg-red-500 text-white"
          }`}
        >
          {request.status === "Rejected"
            ? "Rejected"
            : "Reject"}
        </button>
      </div>
    </div>
  );
}