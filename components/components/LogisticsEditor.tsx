"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  shipmentId: number;

  initialBooking: string;
  initialContainer: string;
  initialContainerSize: string;
  initialShippingLine: string;
  initialVessel: string;
  initialVoyage: string;
  initialBL: string;
  initialDeparturePort: string;
  initialArrivalPort: string;
  initialETD: string;
  initialETA: string;
  initialForwarder: string;
  initialStatus: string;
  initialNotes: string;
};

export default function LogisticsEditor({
  shipmentId,
  initialBooking,
  initialContainer,
  initialContainerSize,
  initialShippingLine,
  initialVessel,
  initialVoyage,
  initialBL,
  initialDeparturePort,
  initialArrivalPort,
  initialETD,
  initialETA,
  initialForwarder,
  initialStatus,
  initialNotes,
}: Props) {
  const [booking, setBooking] = useState(initialBooking || "");
  const [container, setContainer] = useState(initialContainer || "");
  const [containerSize, setContainerSize] = useState(initialContainerSize || "");
  const [shippingLine, setShippingLine] = useState(initialShippingLine || "");
  const [vessel, setVessel] = useState(initialVessel || "");
  const [voyage, setVoyage] = useState(initialVoyage || "");
  const [billOfLading, setBillOfLading] = useState(initialBL || "");
  const [departurePort, setDeparturePort] = useState(initialDeparturePort || "");
  const [arrivalPort, setArrivalPort] = useState(initialArrivalPort || "");
  const [etd, setETD] = useState(initialETD || "");
  const [eta, setETA] = useState(initialETA || "");
  const [forwarder, setForwarder] = useState(initialForwarder || "");
  const [status, setStatus] = useState(initialStatus || "Preparing Shipment");
  const [notes, setNotes] = useState(initialNotes || "");

  const [saving, setSaving] = useState(false);

  async function saveShipment() {
    setSaving(true);

    const { error } = await supabase
      .from("Logistics")
      .update({
        booking_number: booking,
        container_number: container,
        container_size: containerSize,
        shipping_line: shippingLine,
        vessel_name: vessel,
        voyage_number: voyage,
        bill_of_lading: billOfLading,
        departure_port: departurePort,
        arrival_port: arrivalPort,
        etd: etd || null,
        eta: eta || null,
        freight_forwarder: forwarder,
        status,
        notes,
      })
      .eq("id", shipmentId);

    setSaving(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Shipment saved.");
    }
  }

  return (
    <div className="bg-black rounded-xl p-8 mt-8">

      <h2 className="text-2xl font-bold mb-6">
        Edit Shipment
      </h2>

      <div className="grid grid-cols-2 gap-4">

        <input
          value={booking}
          onChange={(e) => setBooking(e.target.value)}
          placeholder="Booking Number"
          className="bg-[#10231e] rounded p-3"
        />

        <input
          value={container}
          onChange={(e) => setContainer(e.target.value)}
          placeholder="Container Number"
          className="bg-[#10231e] rounded p-3"
        />

        <input
          value={containerSize}
          onChange={(e) => setContainerSize(e.target.value)}
          placeholder="Container Size"
          className="bg-[#10231e] rounded p-3"
        />

        <input
          value={shippingLine}
          onChange={(e) => setShippingLine(e.target.value)}
          placeholder="Shipping Line"
          className="bg-[#10231e] rounded p-3"
        />

        <input
          value={vessel}
          onChange={(e) => setVessel(e.target.value)}
          placeholder="Vessel"
          className="bg-[#10231e] rounded p-3"
        />

        <input
          value={voyage}
          onChange={(e) => setVoyage(e.target.value)}
          placeholder="Voyage"
          className="bg-[#10231e] rounded p-3"
        />

        <input
          value={billOfLading}
          onChange={(e) => setBillOfLading(e.target.value)}
          placeholder="Bill of Lading"
          className="bg-[#10231e] rounded p-3"
        />

        <input
          value={departurePort}
          onChange={(e) => setDeparturePort(e.target.value)}
          placeholder="Departure Port"
          className="bg-[#10231e] rounded p-3"
        />

        <input
          value={arrivalPort}
          onChange={(e) => setArrivalPort(e.target.value)}
          placeholder="Arrival Port"
          className="bg-[#10231e] rounded p-3"
        />

        <input
          type="date"
          value={etd}
          onChange={(e) => setETD(e.target.value)}
          className="bg-[#10231e] rounded p-3"
        />

        <input
          type="date"
          value={eta}
          onChange={(e) => setETA(e.target.value)}
          className="bg-[#10231e] rounded p-3"
        />

        <input
          value={forwarder}
          onChange={(e) => setForwarder(e.target.value)}
          placeholder="Freight Forwarder"
          className="bg-[#10231e] rounded p-3"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-[#10231e] rounded p-3"
        >
          <option>Preparing Shipment</option>
          <option>Booked</option>
          <option>Loaded at Port</option>
          <option>At Sea</option>
          <option>Arrived</option>
          <option>Customs Cleared</option>
          <option>Delivered</option>
        </select>

      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes"
        className="w-full bg-[#10231e] rounded p-3 mt-4"
        rows={5}
      />

      <button
        onClick={saveShipment}
        disabled={saving}
        className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl mt-6"
      >
        {saving ? "Saving..." : "Save Shipment"}
      </button>

    </div>
  );
}