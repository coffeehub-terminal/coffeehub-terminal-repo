import { supabase } from "@/lib/supabase";


export default async function LotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: offer } = await supabase
  .from("Offers")
  .select("*")
  .eq("id", id)
  .single();

  if (!offer) {
    return (
      <main className="min-h-screen bg-[#071412] text-white p-10">
        <h1 className="text-4xl font-bold">
          Coffee Not Found
        </h1>

        <div className="mt-4">
          Offer ID: {id}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#071412] text-white p-10">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-5xl font-bold mb-2">
          CoffeeHub
        </h1>

        <div className="text-green-400 mb-10">
          Coffee Detail
        </div>

        <div className="bg-[#10231e] rounded-xl p-8">

          {offer.photos && (
  <img
    src={offer.photos}
    alt={offer.lot_number}
    className="w-full h-80 object-cover rounded-xl mb-6"
  />
)}
          <h2 className="text-4xl font-bold mb-2">
            {offer.lot_number}
          </h2>

          <div className="text-gray-400 mb-8">
            Offer ID: {offer.id}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">

  <div>
    <strong>Status:</strong> {offer.status || "-"}
  </div>

  <div>
    <strong>Producer:</strong> {offer.producer || "-"}
  </div>

  <div>
    <strong>Farm:</strong> {offer.farm || "-"}
  </div>

  <div>
  <strong>Origin:</strong> {offer.origin || "-"}
</div>

  <div>
    <strong>Variety:</strong> {offer.variety || "-"}
  </div>

  <div>
    <strong>Altitude:</strong> {offer.altitude || "-"}
  </div>

  <div>
    <strong>Process:</strong> {offer.process || "-"}
  </div>

  <div>
    <strong>Score:</strong> {offer.score || "-"}
  </div>

  <div>
    <strong>Price (USD/kg):</strong> {offer.price_per_kg || "-"}
  </div>

  <div>
    <strong>Harvest Year:</strong> {offer.harvest_year || "-"}
  </div>

  <div>
    <strong>Required Bags:</strong> {offer.required_bags || "-"}
  </div>

  <div className="col-span-2">
    <strong>Certifications:</strong>
    <div className="mt-1">
      {offer.certifications || "-"}
    </div>
  </div>

  <div className="col-span-2">
    <strong>Cup Notes:</strong>
    <div className="mt-1">
      {offer.cup_notes || "-"}
    </div>
  </div>

</div>

          <div className="flex gap-4">

            <button
  disabled
  className="bg-gray-600 text-white px-6 py-3 rounded-lg font-bold cursor-not-allowed"
>
  Request Sample (Open from Buyer Room)
</button>

            <a
              href="mailto:sales@coffeehubcolombia.com?subject=Pricing Request"
              className="bg-white text-black px-6 py-3 rounded-lg font-bold"
            >
              Request Pricing
            </a>

            <a
              href="/room/ROOM-001"
              className="border border-white px-6 py-3 rounded-lg font-bold"
            >
              Back to Room
            </a>

          </div>

        </div>

      </div>
    </main>
  );
}