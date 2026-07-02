import Link from "next/link";
import { TestRun } from "@/types/test-case";
import { TraceViewer } from "./TraceViewer";

type Props = {
  items: TestRun[];
};

export function RecentRuns({ items }: Props) {
  if (!items.length) {
    return (
      <div className="rounded-lg border p-4">No recent runs available</div>
    );
  }

  return (
    <div className="rounded-lg border bg-fuchsia-900 p-4">
      <h2 className="mb-4 text-lg font-semibold">Recent Runs</h2>

      <div className="space-y-2">
        {items.map((run) => {
          const traceKey = run.traceUrl?.split("/").pop();
          console.log(items);
          console.log(run.traceUrl);

          return (
            <div
              key={run.id}
              className="flex items-center justify-between border-b py-3"
            >
              <div>
                <div className="font-medium">{run.status}</div>

                <div className="text-sm text-gray-400">
                  {run.durationMs ?? 0} ms
                </div>
              </div>

              {traceKey ? (
                <TraceViewer traceKey={traceKey} />
              ) : (
                <span className="text-sm text-gray-500">No Trace</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
