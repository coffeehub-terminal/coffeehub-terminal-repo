import { supabase } from "@/lib/supabase";
import PurchaseOrderActions from "./PurchaseOrderActions";
import GenerateContractButton from "./GenerateContractButton";

export default async function PurchaseOrdersTable() {
  const { data: orders, error } = await supabase
    .from("PurchaseOrders")
    .select("*")
    .order("created_at", { ascending: false });
    const { data: contracts } = await supabase
  .from("Contracts")
  .select("*");

  if (error) {
    return (
      <div className="text-red-500">
        {error.message}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center text-gray-400 py-20">
        No purchase orders yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {orders.map((order: any) => {

  const existingContract = contracts?.find(
    (contract: any) =>
      contract.purchase_order_id === order.id
  );

  return (

        <div
          key={order.id}
          className="bg-black rounded-xl p-6"
        >

          <div className="text-xl font-bold">
            {order.buyer_email}
          </div>

          <div className="text-gray-400 mb-2">
            Offer: {order.offer_id}
          </div>

          <div className="text-gray-400">
            Quantity: {order.quantity}
          </div>

          <div className="text-gray-400">
            Price: ${order.price}
          </div>

          <div className="mt-6 space-y-3">

  <PurchaseOrderActions
    orderId={order.id}
    status={order.status}
  />

  {order.status === "Approved" && (
  existingContract ? (
    <a
      href={`/contracts/${existingContract.id}`}
      className="inline-block bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700"
    >
      View Contract
    </a>
  ) : (
    <GenerateContractButton
      purchaseOrderId={order.id}
      roomId={order.room_id}
      buyerEmail={order.buyer_email}
    />
  )
)}

</div>

        </div>

      );
})}

    </div>
  );
}