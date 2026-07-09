import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/ui";
import { RunResult } from "@/types/run-result";

type Props = {
  items: RunResult[];
};

export function RunResultsTable({ items }: Props) {
  if (!items.length) {
    return (
      <EmptyState
        title="No test runs found"
        description="This batch does not have synced run results yet."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="sticky top-0 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-900 dark:text-gray-400">
          <tr className="border-b border-gray-200 dark:border-gray-800">
            <th className="px-4 py-3 text-left font-medium">Test</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-left font-medium">Duration</th>
            <th className="px-4 py-3 text-left font-medium">Trace</th>
            <th className="px-4 py-3 text-left font-medium">Attempt</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {items.map((run) => (
            <tr
              key={run.id}
              className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <td className="max-w-[420px] truncate px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                {run.testCase?.title ?? run.testCaseId}
              </td>

              <td className="px-4 py-3">
                <StatusBadge status={run.status} />
              </td>

              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                {run.durationMs ? `${run.durationMs} ms` : "-"}
              </td>

              <td className="px-4 py-3">
                {run.traceUrl ? (
                  <a
                    href={run.traceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 items-center rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900"
                  >
                    Open Trace
                  </a>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">-</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                {run.attemptNumber ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
