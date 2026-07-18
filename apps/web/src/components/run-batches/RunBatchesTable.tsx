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
    <div className="overflow-x-auto rounded-xl border border-border bg-surface-raised shadow-sm">
      <table className="w-full min-w-[1040px] text-sm">
        <thead className="sticky top-0 bg-surface text-xs uppercase tracking-wide text-muted">
          <tr className="border-b border-border">
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
        <tbody className="divide-y divide-border">
          {items.map((batch) => {
            const passRate =
              batch.totalCount === 0
                ? 0
                : Number(((batch.passedCount / batch.totalCount) * 100).toFixed(1));

            return (
              <tr
                key={batch.id}
                className="transition-colors hover:bg-surface"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/runs/${batch.id}`}
                    className="font-medium text-accent hover:underline"
                  >
                    {batch.branch ?? "unknown"}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">
                  {batch.commitSha ? batch.commitSha.slice(0, 7) : "-"}
                </td>
                <td className="px-4 py-3 text-foreground">
                  {batch.environment ?? "-"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      passRate < 70
                        ? "font-medium text-red-500"
                        : "font-medium text-foreground"
                    }
                  >
                    {passRate}%
                  </span>
                </td>
                <td className="px-4 py-3 text-foreground">
                  {batch.passedCount}
                </td>
                <td className="px-4 py-3 text-red-500">
                  {batch.failedCount}
                </td>
                <td className="px-4 py-3 text-foreground">
                  {batch.skippedCount}
                </td>
                <td className="px-4 py-3 text-foreground">
                  {batch.triggeredBy ?? "-"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">
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
