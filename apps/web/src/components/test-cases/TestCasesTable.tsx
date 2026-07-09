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
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <table className="w-full min-w-[960px] text-sm">
        <thead className="sticky top-0 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-900 dark:text-gray-400">
          <tr className="border-b border-gray-200 dark:border-gray-800">
            <th className="px-4 py-3 text-left font-medium">Title</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-left font-medium">Owner</th>
            <th className="px-4 py-3 text-left font-medium">Priority</th>
            <th className="px-4 py-3 text-left font-medium">Flaky</th>
            <th className="px-4 py-3 text-left font-medium">Sync State</th>
            <th className="px-4 py-3 text-left font-medium">Last Updated</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {items.map((testCase) => (
            <tr
              key={testCase.id}
              className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <td className="max-w-[360px] px-4 py-3">
                <Link
                  href={`/test-cases/${testCase.id}`}
                  className="font-medium text-blue-700 hover:underline dark:text-blue-300"
                >
                  {testCase.title}
                </Link>
                <div className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                  {testCase.externalId}
                </div>
              </td>

              <td className="px-4 py-3">
                <StatusBadge status={testCase.lastStatus} />
              </td>

              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                {testCase.owner ?? "-"}
              </td>

              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                {testCase.priority ?? "-"}
              </td>

              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                {testCase.isFlaky ? "Yes" : "No"}
              </td>

              <td className="px-4 py-3">
                <SyncStateBadge state={testCase.syncState} />
              </td>

              <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-400">
                {new Date(testCase.updatedAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
