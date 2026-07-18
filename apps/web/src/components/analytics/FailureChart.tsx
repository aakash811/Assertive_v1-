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
          <div className="text-3xl font-semibold tracking-tight text-foreground">
            {failureRate.toFixed(1)}%
          </div>
          <div className="text-sm text-muted">Latest aggregate</div>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-surface-raised">
          <div
            className="h-full rounded-full bg-red-500 transition-all duration-700 ease-out"
            style={{ width: `${width}%` }}
          />
        </div>
      </div>
    </SectionCard>
  );
}
