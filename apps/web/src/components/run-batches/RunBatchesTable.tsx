import Link from "next/link";

import { RunBatch } from "@/types/run-batch";
import { EmptyState } from "@/components/common/ui";

type Props = {
  items: RunBatch[];
};

export function RunBatchesTable({ items }: Props) {
  if (!items.length) {
    return (
      <EmptyState
        title="No run batches yet"
        description="Run your Playwright suite with the Assertive reporter to sync results."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <table className="w-full min-w-[1040px] text-sm">
        <thead className="sticky top-0 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-900 dark:text-gray-400">
          <tr className="border-b border-gray-200 dark:border-gray-800">
            <th className="px-4 py-3 text-left font-medium">Branch</th>
            <th className="px-4 py-3 text-left font-medium">Commit</th>
            <th className="px-4 py-3 text-left font-medium">Environment</th>
            <th className="px-4 py-3 text-left font-medium">Pass Rate</th>
            <th className="px-4 py-3 text-left font-medium">Passed</th>
            <th className="px-4 py-3 text-left font-medium">Failed</th>
            <th className="px-4 py-3 text-left font-medium">Skipped</th>
            <th className="px-4 py-3 text-left font-medium">Triggered By</th>
            <th className="px-4 py-3 text-left font-medium">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {items.map((batch) => {
            const passRate =
              batch.totalCount === 0
                ? 0
                : Number(((batch.passedCount / batch.totalCount) * 100).toFixed(1));

            return (
              <tr
                key={batch.id}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/runs/${batch.id}`}
                    className="font-medium text-blue-700 hover:underline dark:text-blue-300"
                  >
                    {batch.branch ?? "unknown"}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                  {batch.commitSha ? batch.commitSha.slice(0, 7) : "-"}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {batch.environment ?? "-"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      passRate < 70
                        ? "font-medium text-red-700"
                        : "font-medium text-gray-900 dark:text-gray-100"
                    }
                  >
                    {passRate}%
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {batch.passedCount}
                </td>
                <td className="px-4 py-3 text-red-700">
                  {batch.failedCount}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {batch.skippedCount}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {batch.triggeredBy ?? "-"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-400">
                  {new Date(batch.createdAt).toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
