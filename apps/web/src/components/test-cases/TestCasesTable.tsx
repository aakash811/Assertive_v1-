import { TestCase } from "@/types/test-case";
import Link from "next/link";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SyncStateBadge } from "@/components/common/SyncStateBadge";
import { EmptyState } from "@/components/common/ui";

type Props = {
  items: TestCase[];
};

export function TestCasesTable({ items }: Props) {
  if (!items.length) {
    return (
      <EmptyState
        title="No test cases found"
        description="Run the Assertive CLI to sync inventory, or adjust your filters."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface-raised shadow-sm">
      <table className="w-full min-w-[960px] text-sm">
        <thead className="sticky top-0 bg-surface text-xs uppercase tracking-wide text-muted">
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left font-medium">Title</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-left font-medium">Owner</th>
            <th className="px-4 py-3 text-left font-medium">Priority</th>
            <th className="px-4 py-3 text-left font-medium">Flaky</th>
            <th className="px-4 py-3 text-left font-medium">Sync State</th>
            <th className="px-4 py-3 text-left font-medium">Last Updated</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {items.map((testCase) => (
            <tr
              key={testCase.id}
              className="transition-colors hover:bg-surface"
            >
              <td className="max-w-[360px] px-4 py-3">
                <Link
                  href={`/test-cases/${testCase.id}`}
                  className="font-medium text-accent hover:underline"
                >
                  {testCase.title}
                </Link>
                <div className="mt-1 truncate font-mono text-xs text-muted">
                  {testCase.externalId}
                </div>
              </td>

              <td className="px-4 py-3">
                <StatusBadge status={testCase.lastStatus} />
              </td>

              <td className="px-4 py-3 text-foreground">
                {testCase.owner ?? "-"}
              </td>

              <td className="px-4 py-3 text-foreground">
                {testCase.priority ?? "-"}
              </td>

              <td className="px-4 py-3">
                {testCase.isFlaky ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse-subtle" />
                    Flaky
                  </span>
                ) : (
                  <span className="text-xs text-muted">No</span>
                )}
              </td>

              <td className="px-4 py-3">
                <SyncStateBadge state={testCase.syncState} />
              </td>

              <td className="whitespace-nowrap px-4 py-3 text-muted">
                {new Date(testCase.updatedAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
