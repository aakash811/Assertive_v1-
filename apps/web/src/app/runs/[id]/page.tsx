import { MetricCard } from "@/components/dashboard/MetricCard";
import { PageHeader, SectionCard } from "@/components/common/ui";
import { RunResultsTable } from "@/components/run-batches/RunResultsTable";
import { getRunBatch } from "@/lib/api";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RunBatchPage({ params }: Props) {
  const { id } = await params;
  const batch = await getRunBatch(id);

  const successRate =
    batch.totalCount === 0
      ? 0
      : Math.round((batch.passedCount / batch.totalCount) * 100);

  const traceCount = (batch.runs ?? []).filter((run) => run.traceUrl).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Run Batch"
        description={`${batch.branch ?? "unknown"} · ${
          batch.commitSha?.slice(0, 7) ?? "no commit"
        }`}
      />

      <SectionCard title="Batch Information">
        <dl className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <dt className="text-sm font-medium text-gray-600">Branch</dt>
            <dd className="mt-1 text-sm text-gray-950">
              {batch.branch ?? "-"}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-600">Commit</dt>
            <dd className="mt-1 font-mono text-sm text-gray-950">
              {batch.commitSha?.slice(0, 7) ?? "-"}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-600">Environment</dt>
            <dd className="mt-1 text-sm text-gray-950">
              {batch.environment ?? "-"}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-600">Triggered By</dt>
            <dd className="mt-1 text-sm text-gray-950">
              {batch.triggeredBy ?? "-"}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-600">Created</dt>
            <dd className="mt-1 text-sm text-gray-950">
              {new Date(batch.createdAt).toLocaleString()}
            </dd>
          </div>
        </dl>
      </SectionCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard title="Total" value={batch.totalCount} />
        <MetricCard title="Passed" value={batch.passedCount} />
        <MetricCard title="Failed" value={batch.failedCount} />
        <MetricCard title="Skipped" value={batch.skippedCount} />
        <MetricCard title="Success Rate" value={`${successRate}%`} />
      </div>

      <MetricCard
        title="Traces Available"
        value={`${traceCount} / ${batch.runs?.length ?? 0}`}
      />

      <RunResultsTable items={batch.runs ?? []} />
    </div>
  );
}
