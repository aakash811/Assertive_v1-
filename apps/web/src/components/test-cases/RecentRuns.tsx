import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState, SectionCard } from "@/components/common/ui";
import { TestRun } from "@/types/test-case";
import { TraceViewer } from "./TraceViewer";

type Props = {
  items: TestRun[];
};

export function RecentRuns({ items }: Props) {
  if (!items.length) {
    return (
      <EmptyState
        title="No recent runs available"
        description="Recent executions for this test will appear after sync."
      />
    );
  }

  return (
    <SectionCard title="Recent Runs">
      <div className="divide-y divide-gray-200">
        {items.map((run) => {
          const traceKey = run.traceUrl?.split("/").pop();

          return (
            <div
              key={run.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <StatusBadge status={run.status} />
                <span className="text-sm text-gray-600">
                  {run.durationMs ?? 0} ms
                </span>
              </div>

              {traceKey ? (
                <TraceViewer traceKey={traceKey} />
              ) : (
                <span className="text-sm text-gray-500">No trace</span>
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
