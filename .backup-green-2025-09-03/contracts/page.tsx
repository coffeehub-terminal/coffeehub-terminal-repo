import ContractsTable from "@/components/components/ContractsTable";

export default function ContractsPage() {
  return (
    <main className="min-h-screen bg-[#071412] text-white p-10">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-5xl font-bold mb-2">
          Contracts
        </h1>

        <div className="text-green-400 mb-10">
          CoffeeHub CRM
        </div>

        <ContractsTable />

      </div>
    </main>
  );
}