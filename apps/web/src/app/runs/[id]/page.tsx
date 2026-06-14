import { getRunBatch } from "@/lib/api";

import { RunResultsTable } from "@/components/run-batches/RunResultsTable";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RunBatchPage({ params }: Props) {
  const { id } = await params;

  const batch = await getRunBatch(id);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <h2 className="mb-4 text-lg font-semibold">Batch Information</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <strong>Branch:</strong> {batch.branch ?? "-"}
          </div>

          <div>
            <strong>Commit:</strong> {batch.commitSha?.slice(0, 7) ?? "-"}
          </div>

          <div>
            <strong>Environment:</strong> {batch.environment ?? "-"}
          </div>

          <div>
            <strong>Triggered By:</strong> {batch.triggeredBy ?? "-"}
          </div>

          <div>
            <strong>Created:</strong>{" "}
            {new Date(batch.createdAt).toLocaleString()}
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-bold">Run Batch</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          Total
          <div className="text-2xl font-bold">{batch.totalCount}</div>
        </div>

        <div className="rounded-lg border p-4">
          Passed
          <div className="text-2xl font-bold">{batch.passedCount}</div>
        </div>

        <div className="rounded-lg border p-4">
          Failed
          <div className="text-2xl font-bold">{batch.failedCount}</div>
        </div>

        <div className="rounded-lg border p-4">
          Skipped
          <div className="text-2xl font-bold">{batch.skippedCount}</div>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="mb-2 text-sm text-gray-500">Success Rate</div>

        <div className="h-4 overflow-x-auto rounded bg-gray-200">
          <div
            className="h-full bg-green-500"
            style={{
              width: `${
                batch.totalCount === 0
                  ? 0
                  : (batch.passedCount / batch.totalCount) * 100
              }%`,
            }}
          />
        </div>
      </div>

      <RunResultsTable items={batch.runs ?? []} />
    </div>
  );
}
