import { EmptyState, SectionCard } from "@/components/common/ui";

type Props = {
  passRate: number;
};

export function PassRateChart({ passRate }: Props) {
  if (!Number.isFinite(passRate)) {
    return (
      <EmptyState
        title="No pass rate data"
        description="Run your first Playwright sync to populate this chart."
      />
    );
  }

  const width = Math.max(0, Math.min(100, passRate));

  return (
    <SectionCard title="Pass Rate">
      <div className="p-5">
        <div className="mb-4 flex items-baseline justify-between">
          <div className="text-3xl font-semibold tracking-tight text-foreground">
            {passRate.toFixed(1)}%
          </div>
          <div className="text-sm text-muted">Latest aggregate</div>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-surface-raised">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
            style={{ width: `${width}%` }}
          />
        </div>
      </div>
    </SectionCard>
  );
}
