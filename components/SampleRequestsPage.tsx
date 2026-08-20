import SampleRequestsTable from "./SampleRequestsTable";

export default function SampleRequestsPage() {
  return (
    <main className="min-h-screen bg-[#071412] text-white p-10">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-5xl font-bold mb-2">
          Sample Requests
        </h1>

        <div className="text-green-400 mb-10">
          CRM
        </div>

        <div className="bg-[#10231e] rounded-xl p-8">

          <SampleRequestsTable />

        </div>

      </div>

    </main>
  );
}