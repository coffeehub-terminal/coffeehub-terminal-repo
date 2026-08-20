import { supabase } from "@/lib/supabase";
import ContractActions from "./ContractActions";

export default async function ContractsTable() {
  const { data: contracts, error } = await supabase
    .from("Contracts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="text-red-500">
        {error.message}
      </div>
    );
  }

  if (!contracts || contracts.length === 0) {
    return (
      <div className="text-center text-gray-400 py-20">
        No contracts yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {contracts.map((contract: any) => (
        <div
          key={contract.id}
          className="bg-black rounded-xl p-6"
        >
          <div className="text-xl font-bold">
            {contract.contract_number || "Draft Contract"}
          </div>

          <div className="text-gray-400">
            Buyer: {contract.buyer_email}
          </div>

          <div className="text-gray-400">
            Purchase Order: {contract.purchase_order_id}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">

            <a
              href={`/contracts/${contract.id}`}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-bold"
            >
              📄 View Contract
            </a>

            <ContractActions
              contractId={contract.id}
              status={contract.status}
            />

          </div>
        </div>
      ))}
    </div>
  );
}