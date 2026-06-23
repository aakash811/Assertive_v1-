import { StatusBadge } from "@/components/common/StatusBadge";
import { RunResult } from "@/types/run-result";

type Props = {
  items: RunResult[];
};

export function RunResultsTable({ items }: Props) {
  if (!items.length) {
    return (
      <div className="rounded-lg border p-8 text-center">
        No test runs found
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border bg-emerald-900">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-3 text-left">Test</th>

            <th className="px-4 py-3 text-left">Status</th>

            <th className="px-4 py-3 text-left">Duration</th>

            <th className="px-4 py-3 text-left">Trace</th>

            <th className="px-4 py-3 text-left">Attempt</th>
          </tr>
        </thead>

        <tbody>
          {items.map((run) => (
            <tr
              key={run.id}
              className="border-b transition-colors hover:bg-emerald-700"
            >
              <td className="px-4 py-3">
                {run.testCase?.title ?? run.testCaseId}
              </td>

              <td className="px-4 py-3">
                <StatusBadge status={run.status} />
              </td>

              <td className="px-4 py-3">
                {run.durationMs ? `${run.durationMs} ms` : "-"}
              </td>

              <td className="px-4 py-3">
                {run.traceUrl ? (
                  <a
                    href={run.traceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Trace
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-4 py-3">{run.attemptNumber ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
