import { TestRun } from "@/types/test-case";

type Props = {
  items: TestRun[];
  testCaseId: string;
};

export function RecentRuns({ items, testCaseId }: Props) {
  const runs = items.filter((run) => run.testCaseId === testCaseId);
  if (!runs.length) {
    return (
      <div className="rounded-lg border p-4">No recent runs available</div>
    );
  }
  return (
    <div className="rounded-lg border bg-fuchsia-900 p-4">
      <h2 className="mb-4 text-lg font-semibold">Recent Runs</h2>

      <div className="space-y-2">
        {runs.map((run) => (
          <div key={run.id} className="flex justify-between border-b py-2">
            <span>{run.status}</span>

            <span>{run.durationMs ?? 0} ms</span>
          </div>
        ))}
      </div>
    </div>
  );
}
