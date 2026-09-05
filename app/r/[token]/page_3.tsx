import { supabase } from "@/lib/supabase";
import SampleRequestButton from "@/components/SampleRequestButton";
import PurchaseOrderButton from "@/components/PurchaseOrderButton";

export default async function RoomPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { data: room } = await supabase.from("Rooms").select("*").eq("share_token", token).maybeSingle();
  if(!room) return <main className="min-h-screen bg-[#FBFBF9] p-10 text-sm">Room not found for token {token}</main>;

  const { data: participants } = await supabase.from("RoomParticipants").select("*").eq("room_id", room?.id);
  const offerIds = room?.offer_ids?.split(",").map((id: string) => id.trim()).filter(Boolean) || [];
  const { data: offers } = await supabase.from("Offers").select("*").in("id", offerIds.length?offerIds:["NONE"]);

  const { data: samples } = await supabase.from("Samples").select("*").eq("room_id", room?.id).order("created_at",{ascending:false});
  const existingSample = samples && samples.length > 0? samples[0] : null;

  const { data: sampleRequests } = await supabase.from("SampleRequests").select("*").eq("room_id", room?.id).order("created_at",{ascending:false}).limit(1);
  const existingRequest = sampleRequests && sampleRequests.length > 0? sampleRequests[0] : null;

  const { data: purchaseOrders } = await supabase.from("PurchaseOrders").select("*").eq("room_id", room?.id);
  const existingPurchaseOrder = purchaseOrders && purchaseOrders.length > 0? purchaseOrders[0] : null;

  let contracts:any[] = []; let logistics:any[] = []; let docs:any[] = [];
  if(purchaseOrders && purchaseOrders.length>0){
    const poIds = purchaseOrders.map((p:any)=>p.id);
    const {data:contractData} = await supabase.from("Contracts").select("*").in("purchase_order_id", poIds);
    if(contractData) contracts = contractData;
    if(contracts.length>0){
      const contractIds = contracts.map((c:any)=>c.id);
      const {data:logData} = await supabase.from("Logistics").select("*").in("contract_id", contractIds);
      if(logData) logistics = logData;
      if(logData && logData.length>0){
        const logIds = logData.map((l:any)=>l.id);
        const {data:docData} = await supabase.from("ShipmentDocuments").select("*").in("shipment_id", logIds);
        if(docData) docs = docData;
      }
    }
  }

  const steps = [
    { key:"Requested", done: !!existingRequest },
    { key:"Preparing", done: existingSample?.status==="Preparing" || existingSample?.status==="Shipped" || existingSample?.status==="Delivered" },
    { key:"Shipped", done: existingSample?.status==="Shipped" || existingSample?.status==="Delivered" },
    { key:"Delivered", done: existingSample?.status==="Delivered" },
  ];

  return (
    <main className="min-h-screen bg-[#FBFBF9] text-[#111]">
      <div className="sticky top-0 bg-white border-b px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2"><div className="w-7 h-7 bg-black text-white flex items-center justify-center font-bold text-xs rounded">CH</div><span className="font-semibold text-sm">CoffeeHub Buyer Portal</span><span className="ml-3 text-xs px-2 py-0.5 rounded-full bg-[#F5F5F2] border">{room.id} • {room.status}</span></div>
      </div>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="bg-white border rounded p-5 grid grid-cols-3 gap-4 text-sm">
          <div>Offers: <b>{offers?.length||0}</b></div><div>Participants: <b>{participants?.length||0}</b></div><div>Status: <b>{room.status}</b></div>
          <div className="col-span-3 text-xs text-[#888] mt-2">{participants?.map((p:any)=>p.email).join(", ")}</div>
        </div>

        <section className="bg-white border rounded p-5">
          {existingSample? (
            <div>
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm">Sample Shipment — <span className="text-green-700">{existingSample.status}</span></div>
                <span className="text-[10px] px-2 py-1 rounded-full bg-green-50 border border-green-200 text-green-700">{existingSample.status}</span>
              </div>
              {/* Timeline */}
              <div className="flex gap-2 mt-4">
                {steps.map(s=>(
                  <div key={s.key} className={`flex-1 h-2 rounded-full ${s.done?"bg-green-500":"bg-gray-200"}`} title={s.key} />
                ))}
              </div>
              <div className="flex gap-2 mt-1 text-[10px] text-[#888]">
                {steps.map(s=><div key={s.key} className="flex-1">{s.key}</div>)}
              </div>
              <div className="mt-4 bg-[#F6FEF9] border border-green-100 rounded-xl p-4 text-sm">
                <div>Courier: <b>{existingSample.courier||"— To be updated by exporter"}</b></div>
                <div className="mt-1">Tracking: <b className="font-mono">{existingSample.tracking_number||"—"}</b></div>
                {existingSample.tracking_number && <div className="mt-2 text-xs text-[#666]">You will receive an email when it ships. Contact trade@coffeehubcolombia.com for questions.</div>}
              </div>
            </div>
          ) : existingRequest? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="font-bold text-sm text-blue-800">Sample Request Submitted ✓</div>
              <div className="text-xs mt-2 text-blue-700">Exporter has been notified. You will receive courier + tracking here once prepared.</div>
              <div className="flex gap-2 mt-3">
                {steps.map(s=><div key={s.key} className={`flex-1 h-2 rounded-full ${s.done?"bg-blue-500":"bg-blue-100"}`} />)}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-sm mb-2">Need a sample?</h3>
              <p className="text-xs text-[#666] mb-3">Exporter will be notified instantly by email and can add courier & tracking.</p>
              <SampleRequestButton offers={offers||[]} roomId={room?.id||""} buyerEmail={participants?.[0]?.email||""}  />
            </div>
          )}
        </section>

        <section className="bg-white border rounded">
          <div className="px-5 py-3 border-b"><h2 className="text-sm font-semibold">Available Coffees</h2></div>
          <div className="divide-y">
            {offers?.map((offer:any)=>(
              <div key={offer.id} className="px-5 py-4">
                <div className="font-medium text-sm">{offer.lot_number} • {offer.origin} • ${offer.price_per_kg ?? 0}/kg • {offer.score||"-"} pts</div>
                <div className="text-xs text-[#888] mt-1">{offer.variety} • {offer.farm} • {offer.process} • {offer.required_bags} Bags • Status {offer.status}</div>
                <div className="mt-3 flex gap-2">
                  <a href={`/lot/${offer.id}`} className="h-7 px-3 border rounded text-xs flex items-center">View Coffee →</a>
                  <PurchaseOrderButton roomId={room?.id||""} buyerEmail={participants?.[0]?.email||""} offerId={offer.id} price={offer.price_per_kg ?? 0} purchaseOrder={purchaseOrders?.find((p:any)=>p.offer_id===offer.id)} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border rounded"><div className="px-5 py-3 border-b"><h2 className="text-sm font-semibold">Purchase Orders • {purchaseOrders?.length||0}</h2></div><div className="divide-y">{purchaseOrders?.map((p:any)=><div key={p.id} className="px-5 py-3 text-sm">{p.id} • {p.status} • {p.quantity_bags||"-"} bags • ${p.price_per_kg||0}/kg</div>)}{!purchaseOrders?.length && <div className="p-6 text-xs text-[#999]">No PO yet</div>}</div></section>
        <section className="bg-white border rounded"><div className="px-5 py-3 border-b"><h2 className="text-sm font-semibold">Contracts • {contracts.length}</h2></div><div className="divide-y">{contracts.map((c:any)=><div key={c.id} className="px-5 py-3 text-sm flex justify-between"><span>{c.id} • {c.status} • {c.total_value_usd?`$${c.total_value_usd}`:""}</span><span className="text-xs border px-2 py-1 rounded">View</span></div>)}{contracts.length===0 && <div className="p-6 text-xs text-[#999]">No contracts yet</div>}</div></section>
        <section className="bg-white border rounded"><div className="px-5 py-3 border-b"><h2 className="text-sm font-semibold">Logistics • {logistics.length}</h2></div><div className="divide-y">{logistics.map((l:any)=><div key={l.id} className="px-5 py-3 text-sm"><a href={`/r/${token}/logistics/${l.id}`} className="underline">{l.status} • Booking {l.booking_number||"-"} • Container {l.container_number||"-"}</a> • Vessel {l.vessel_name||"-"} • ETA {l.eta?new Date(l.eta).toLocaleDateString():"-"}</div>)}{logistics.length===0 && <div className="p-6 text-xs text-[#999]">No shipment booked yet</div>}</div></section>
      </div>
    </main>
  );
}
