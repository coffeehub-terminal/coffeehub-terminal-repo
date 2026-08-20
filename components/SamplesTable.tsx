import { supabase } from "@/lib/supabase";

export default async function SamplesTable() {
  const { data: requests } = await supabase
    .from("SampleRequests")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">

      {requests?.map((request) => (

        <div
          key={request.id}
          className="bg-[#10231e] rounded-xl p-6"
        >

          <div className="flex justify-between">

            <div>

              <div className="font-bold text-xl">
                {request.buyer_email}
              </div>

              <div className="text-gray-400">
                {request.status}
              </div>

            </div>

            <div className="text-gray-500">
              {request.created_at}
            </div>

          </div>

        </div>

      ))}

    </div>
  );
}