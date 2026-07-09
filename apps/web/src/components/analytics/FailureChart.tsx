import { EmptyState, SectionCard } from "@/components/common/ui";

type Props = {
  failureRate: number;
};

export function FailureChart({ failureRate }: Props) {
  if (!Number.isFinite(failureRate)) {
    return (
      <EmptyState
        title="No failure rate data"
        description="Failures will appear after run results are synced."
      />
    );
  }

  const width = Math.max(0, Math.min(100, failureRate));

  return (
    <SectionCard title="Failure Rate">
      <div className="p-5">
        <div className="mb-4 flex items-baseline justify-between">
          <div className="text-3xl font-semibold tracking-tight text-gray-950 dark:text-gray-50">
            {failureRate}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Latest aggregate
          </div>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div className="h-full bg-red-600" style={{ width: `${width}%` }} />
        </div>
      </div>
    </SectionCard>
  );
}
