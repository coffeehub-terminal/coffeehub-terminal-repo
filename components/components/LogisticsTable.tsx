import { supabase } from "@/lib/supabase";
import LogisticsEditor from "./LogisticsEditor";
import ShipmentDocuments from "./ShipmentDocuments";

export default async function LogisticsTable() {
  const { data: logistics, error } = await supabase
    .from("Logistics")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="text-red-500">
        {error.message}
      </div>
    );
  }

  if (!logistics || logistics.length === 0) {
    return (
      <div className="text-center text-gray-400 py-20">
        No shipments yet.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {logistics.map((shipment: any) => (
        <div
          key={shipment.id}
          className="bg-black rounded-xl p-8"
        >
          <h2 className="text-3xl font-bold mb-6">
            Contract #{shipment.contract_id}
          </h2>

          <div className="grid grid-cols-2 gap-6 mb-8">

            <div>
              <div className="text-gray-400">Booking</div>
              <div>{shipment.booking_number || "-"}</div>
            </div>

            <div>
              <div className="text-gray-400">Container</div>
              <div>{shipment.container_number || "-"}</div>
            </div>

            <div>
              <div className="text-gray-400">Container Size</div>
              <div>{shipment.container_size || "-"}</div>
            </div>

            <div>
              <div className="text-gray-400">Shipping Line</div>
              <div>{shipment.shipping_line || "-"}</div>
            </div>

            <div>
              <div className="text-gray-400">Vessel</div>
              <div>{shipment.vessel_name || "-"}</div>
            </div>

            <div>
              <div className="text-gray-400">Voyage</div>
              <div>{shipment.voyage_number || "-"}</div>
            </div>

            <div>
              <div className="text-gray-400">Bill of Lading</div>
              <div>{shipment.bill_of_lading || "-"}</div>
            </div>

            <div>
              <div className="text-gray-400">Departure Port</div>
              <div>{shipment.departure_port || "-"}</div>
            </div>

            <div>
              <div className="text-gray-400">Arrival Port</div>
              <div>{shipment.arrival_port || "-"}</div>
            </div>

            <div>
              <div className="text-gray-400">ETD</div>
              <div>{shipment.etd || "-"}</div>
            </div>

            <div>
              <div className="text-gray-400">ETA</div>
              <div>{shipment.eta || "-"}</div>
            </div>

            <div>
              <div className="text-gray-400">Freight Forwarder</div>
              <div>{shipment.freight_forwarder || "-"}</div>
            </div>

            <div>
              <div className="text-gray-400">Status</div>
              <div className="font-bold text-green-400">
                {shipment.status || "Preparing Shipment"}
              </div>
            </div>

            <div className="col-span-2">
              <div className="text-gray-400">Notes</div>
              <div>{shipment.notes || "-"}</div>
            </div>

          </div>

          <LogisticsEditor
            shipmentId={shipment.id}
            initialBooking={shipment.booking_number || ""}
            initialContainer={shipment.container_number || ""}
            initialContainerSize={shipment.container_size || ""}
            initialShippingLine={shipment.shipping_line || ""}
            initialVessel={shipment.vessel_name || ""}
            initialVoyage={shipment.voyage_number || ""}
            initialBL={shipment.bill_of_lading || ""}
            initialDeparturePort={shipment.departure_port || ""}
            initialArrivalPort={shipment.arrival_port || ""}
            initialETD={shipment.etd || ""}
            initialETA={shipment.eta || ""}
            initialForwarder={shipment.freight_forwarder || ""}
            initialStatus={shipment.status || "Preparing Shipment"}
            initialNotes={shipment.notes || ""}
          />

          <ShipmentDocuments
            logisticsId={shipment.id}
          />

        </div>
      ))}
    </div>
  );
}