import { getRunBatches } from "@/lib/api";

import { RunBatchesTable } from "@/components/run-batches/RunBatchesTable";

export default async function RunsPage() {
  const result = await getRunBatches();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Run Batches</h1>

      <RunBatchesTable items={result.items} />
    </div>
  );
}
