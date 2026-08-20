import SampleOrdersTable from "./SampleOrdersTable";

export default function SampleOrdersPage() {
  return (
    <main className="min-h-screen bg-[#071412] text-white p-10">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-5xl font-bold mb-2">
          Sample Orders
        </h1>

        <div className="text-green-400 mb-10">
          Logistics
        </div>

        <div className="bg-[#10231e] rounded-xl p-8">

          <SampleOrdersTable />

        </div>

      </div>

    </main>
  );
}