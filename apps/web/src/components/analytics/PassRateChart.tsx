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
          <div className="text-3xl font-semibold tracking-tight text-gray-950 dark:text-gray-50">
            {passRate}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Latest aggregate
          </div>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div className="h-full bg-blue-600" style={{ width: `${width}%` }} />
        </div>
      </div>
    </SectionCard>
  );
}
