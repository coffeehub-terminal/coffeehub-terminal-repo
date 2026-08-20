import { supabase } from "@/lib/supabase";
import DocumentUploader from "./DocumentUploader";

type Props = {
  logisticsId: number;
};

export default async function ShipmentDocuments({
  logisticsId,
}: Props) {
  const { data: documents } = await supabase
    .from("ShipmentDocuments")
    .select("*")
    .eq("logistics_id", logisticsId);

  const types = [
    "Bill of Lading",
    "Commercial Invoice",
    "Packing List",
    "Certificate of Origin",
    "Phytosanitary Certificate",
  ];

  return (
    <div className="bg-[#071412] rounded-xl p-6 mt-8">

      <h2 className="text-2xl font-bold mb-6">
        Shipment Documents
      </h2>

      <div className="space-y-4">

        {types.map((type) => {

          const doc = documents?.find(
            (d: any) => d.document_type === type
          );

          return (
            <div
              key={type}
              className="bg-black rounded-xl p-5 flex justify-between items-center"
            >

              <div>

                <div className="font-bold">
                  {type}
                </div>

                <div className="text-gray-400 text-sm">

                  {doc
                    ? doc.file_name
                    : "No document uploaded"}

                </div>

              </div>

              {doc ? (

                <div className="flex gap-3">

                  <a
                    href={`/api/documents/${doc.id}`}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-bold"
                  >
                    Download
                  </a>

                  <DocumentUploader
                    logisticsId={logisticsId}
                    documentType={type}
                  />

                </div>

              ) : (

                <DocumentUploader
                  logisticsId={logisticsId}
                  documentType={type}
                />

              )}

            </div>
          );

        })}

      </div>

    </div>
  );
}