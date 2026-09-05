"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LogisticsDetail() {
  const params = useParams() as { token?: string; id?: string };
  const token = params?.token as string;
  const id = params?.id ? decodeURIComponent(params.id as string) : "";
  const [log, setLog] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error: err } = await supabase.from("Logistics").select("*").eq("id", id).maybeSingle();
      if (data) setLog(data);
      else {
        const { data: byBooking } = await supabase.from("Logistics").select("*").eq("booking_number", id).maybeSingle();
        if (byBooking) setLog(byBooking);
        else setError(err?.message || `Logistics not found: ${id}`);
      }
    })();
  }, [id]);

  if (!id) return <main className="p-10 text-sm">Missing logistics id... {JSON.stringify(params)}</main>;
  if (error) return <main className="p-10 text-sm"><div className="bg-red-50 border p-4 rounded text-red-700">{error}</div><a href={`/r/${token}`} className="mt-4 inline-block text-xs border px-3 py-1 rounded">← Back</a></main>;
  if (!log) return <main className="p-10 text-sm">Loading logistics {id}...</main>;

  return (
    <main className="min-h-screen bg-[#FBFBF9] p-10">
      <div className="max-w-2xl bg-white border rounded-[16px] p-6">
        <h1 className="font-bold text-lg">Logistics {log.id}</h1>
        <div className="text-sm mt-4 space-y-1">
          <div>Booking: {log.booking_number || "-"}</div>
          <div>Container: {log.container_number || "-"}</div>
          <div>Vessel: {log.vessel_name || "-"}</div>
          <div>Status: {log.status || "-"}</div>
        </div>
        <a href={`/r/${token}`} className="mt-6 inline-block text-xs border px-3 py-1.5 rounded-full">← Back to buyer room</a>
      </div>
    </main>
  );
}
