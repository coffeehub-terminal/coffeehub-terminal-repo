import { supabase } from "@/lib/supabase";
import ContractEditor from "@/components/components/ContractEditor";
import CreateShipmentButton from "@/components/components/CreateShipmentButton";

export default async function ContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: contract, error } = await supabase
    .from("Contracts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !contract) {
    return (
      <main className="min-h-screen bg-[#071412] text-white p-10">
        <div className="text-red-500">
          Contract not found.
        </div>
      </main>
    );
  }

  const { data: purchaseOrder } = await supabase
    .from("PurchaseOrders")
    .select("*")
    .eq("id", contract.purchase_order_id)
    .single();

  const { data: offer } = await supabase
    .from("Offers")
    .select("*")
    .eq("id", purchaseOrder?.offer_id)
    .single();

  return (
    <main className="min-h-screen bg-[#071412] text-white p-10">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-5xl font-bold mb-2">
          CoffeeHub Sales Contract
        </h1>

        <div className="text-green-400 mb-10">
          {contract.contract_number}
        </div>

        <div className="bg-[#10231e] rounded-xl p-8 space-y-8">

          {/* Contract Information */}

          <div>
            <h2 className="text-2xl font-bold mb-4">
              Contract Information
            </h2>

            <div className="grid grid-cols-2 gap-6">

              <div>
                <div className="text-gray-400">
                  Status
                </div>

                <div className="text-xl font-bold">
                  {contract.status}
                </div>
              </div>

              <div>
                <div className="text-gray-400">
                  Contract Number
                </div>

                <div className="text-xl">
                  {contract.contract_number}
                </div>
              </div>

            </div>
          </div>

          <hr className="border-gray-700" />

          {/* Buyer */}

          <div>

            <h2 className="text-2xl font-bold mb-4">
              Buyer
            </h2>

            <div>
              <div className="text-gray-400">
                Buyer Email
              </div>

              <div className="text-xl">
                {contract.buyer_email}
              </div>
            </div>

          </div>

          <hr className="border-gray-700" />

          {/* Coffee */}

          <div>

            <h2 className="text-2xl font-bold mb-4">
              Coffee Details
            </h2>

            <div className="grid grid-cols-2 gap-6">

              <div>
                <div className="text-gray-400">
                  Lot
                </div>

                <div className="text-xl font-bold">
                  {offer?.lot_number}
                </div>
              </div>

              <div>
                <div className="text-gray-400">
                  Origin
                </div>

                <div className="text-xl">
                  {offer?.origin}
                </div>
              </div>

              <div>
                <div className="text-gray-400">
                  Process
                </div>

                <div className="text-xl">
                  {offer?.process}
                </div>
              </div>

              <div>
                <div className="text-gray-400">
                  Variety
                </div>

                <div className="text-xl">
                  {offer?.variety}
                </div>
              </div>

              <div>
                <div className="text-gray-400">
                  Farm
                </div>

                <div className="text-xl">
                  {offer?.farm}
                </div>
              </div>

              <div>
                <div className="text-gray-400">
                  Producer
                </div>

                <div className="text-xl">
                  {offer?.producer}
                </div>
              </div>

            </div>

          </div>

          <hr className="border-gray-700" />

          {/* Commercial Terms */}

          <div>

            <h2 className="text-2xl font-bold mb-4">
              Commercial Terms
            </h2>

            <div className="grid grid-cols-2 gap-6">

              <div>
                <div className="text-gray-400">
                  Quantity
                </div>

                <div className="text-xl">
                  {purchaseOrder?.quantity} Bags
                </div>
              </div>

              <div>
                <div className="text-gray-400">
                  Price (USD/kg)
                </div>

                <div className="text-xl">
                  ${contract.price || purchaseOrder?.price} / kg
                </div>
              </div>

              <div>
                <div className="text-gray-400">
                  Incoterm
                </div>

                <div className="text-xl">
                  {contract.incoterm || "Not specified"}
                </div>
              </div>

              <div>
                <div className="text-gray-400">
                  Shipment Window
                </div>

                <div className="text-xl">
                  {contract.shipment_window || "Not specified"}
                </div>
              </div>

              <div>
                <div className="text-gray-400">
                  Payment Terms
                </div>

                <div className="text-xl">
                  {contract.payment_terms || "Not specified"}
                </div>
              </div>

              <div className="col-span-2">
                <div className="text-gray-400">
                  Special Conditions
                </div>

                <div className="text-xl whitespace-pre-wrap">
                  {contract.special_conditions || "None"}
                </div>
              </div>

            </div>

          </div>

        </div>

        <ContractEditor
          contractId={contract.id}
          initialPrice={
  contract.price ??
  purchaseOrder?.price ??
  ""
}
          initialIncoterm={contract.incoterm || ""}
          initialShipmentWindow={contract.shipment_window || ""}
          initialPaymentTerms={contract.payment_terms || ""}
          initialSpecialConditions={contract.special_conditions || ""}
        />
        <div className="mt-8">
  <CreateShipmentButton
    contractId={contract.id}
    buyerEmail={contract.buyer_email}
  />
</div>

      </div>
    </main>
  );
}