import { supabase } from "@/lib/supabase";
import SampleRequestCard from "./SampleRequestCard";

export default async function SampleRequestsTable() {
  const { data: requests, error } = await supabase
    .from("SampleRequests")
    .select(`
      *,
      SampleRequestOffers (
        offer_id,
        Offers (
          lot_number,
          origin
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="text-red-500 p-6">
        {error.message}
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center text-gray-400 py-20">
        No sample requests yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {requests.map((request: any) => (
        <SampleRequestCard
          key={request.id}
          request={request}
        />
      ))}
    </div>
  );
}