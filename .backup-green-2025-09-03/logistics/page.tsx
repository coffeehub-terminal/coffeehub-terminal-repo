import LogisticsTable from "@/components/components/LogisticsTable";

export default function LogisticsPage() {
  return (
    <main className="min-h-screen bg-[#071412] text-white p-10">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-5xl font-bold mb-2">
          Logistics
        </h1>

        <div className="text-green-400 mb-10">
          CoffeeHub CRM
        </div>

        <LogisticsTable />

      </div>
    </main>
  );
}