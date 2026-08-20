"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { createActivity } from "../lib/activity";

interface Offer {
  id: string;
  lot_number: string;
}

interface Props {
  roomId: string;
  buyerEmail: string;
  offers: Offer[];
}

export default function SampleRequestButton({
  roomId,
  buyerEmail,
  offers,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function requestSamples() {
    if (loading) return;

    setLoading(true);

    try {
      // --------------------------------------------------
      // Prevent duplicate Sample Requests
      // --------------------------------------------------

      const { data: existingRequest, error: existingError } =
        await supabase
          .from("SampleRequests")
          .select("id")
          .eq("room_id", roomId)
          .limit(1);

      if (existingError) throw existingError;

      if (existingRequest && existingRequest.length > 0) {
        alert("A sample request has already been submitted for this room.");
        router.refresh();
        return;
      }

      // --------------------------------------------------
      // Create Sample Request
      // --------------------------------------------------

      const { data: sampleRequest, error: requestError } =
        await supabase
          .from("SampleRequests")
          .insert({
            room_id: roomId,
            buyer_email: buyerEmail,
            status: "Pending",
          })
          .select()
          .single();

      if (requestError) throw requestError;

      // --------------------------------------------------
      // Create SampleRequestOffers
      // --------------------------------------------------

      const rows = offers.map((offer) => ({
        sample_request_id: sampleRequest.id,
        offer_id: offer.id,
      }));

      const { error: offerError } = await supabase
        .from("SampleRequestOffers")
        .insert(rows);

      if (offerError) throw offerError;

      // --------------------------------------------------
      // Create Activity
      // --------------------------------------------------

      await createActivity({
        entityType: "SampleRequest",
        entityId: sampleRequest.id,
        roomId: roomId,
        action: "requested",
        title: "New Sample Request",
        description: `${buyerEmail} requested samples.`,
        link: "/sample-requests",
        createdBy: buyerEmail,
      });

      alert("Sample request submitted successfully.");

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Unable to submit sample request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={requestSamples}
      disabled={loading}
      className={`px-6 py-3 rounded-lg font-semibold transition ${
        loading
          ? "bg-gray-600 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700"
      }`}
    >
      {loading ? "Submitting..." : "Request Samples"}
    </button>
  );
}