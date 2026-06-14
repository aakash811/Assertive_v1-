import Link from "next/link";

import { RunBatch } from "@/types/run-batch";

type Props = {
  items: RunBatch[];
};

export function RunBatchesTable({ items }: Props) {
  if (!items.length) {
    return (
      <div className="rounded-lg border p-8 text-center">
        No run batches found
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border bg-neutral-600">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-olive-800">
            <th className="px-4 py-3 text-left">Branch</th>
            <th className="px-4 py-3 text-left">Commit</th>
            <th className="px-4 py-3 text-left">Environment</th>
            <th className="px-4 py-3 text-left">Pass Rate</th>
            <th className="px-4 py-3 text-left">Passed</th>
            <th className="px-4 py-3 text-left">Failed</th>
            <th className="px-4 py-3 text-left">Skipped</th>
            <th className="px-4 py-3 text-left">Triggered By</th>
            <th className="px-4 py-3 text-left">Created</th>
          </tr>
        </thead>
        <tbody>
          {items.map((batch) => {
            const passRate =
              batch.totalCount === 0
                ? 0
                : ((batch.passedCount / batch.totalCount) * 100).toFixed(1);

            return (
              <tr key={batch.id} className="border-b">
                <td className="px-4 py-3">
                  <Link
                    href={`/runs/${batch.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {batch.branch ?? "unknown"}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono">
                  {batch.commitSha ? batch.commitSha.slice(0, 7) : "-"}
                </td>
                <td className="px-4 py-3">{batch.environment ?? "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      Number(passRate) >= 90
                        ? "text-green-600"
                        : Number(passRate) >= 70
                          ? "text-yellow-600"
                          : "text-red-600"
                    }
                  >
                    {passRate}%
                  </span>
                </td>
                <td className="px-4 py-3">{batch.passedCount}</td>
                <td className="px-4 py-3">{batch.failedCount}</td>
                <td className="px-4 py-3">{batch.skippedCount}</td>
                <td className="px-4 py-3">{batch.triggeredBy ?? "-"}</td>
                <td className="px-4 py-3">
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
