import { TestCase } from "@/types/test-case";
import Link from "next/link";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SyncStateBadge } from "@/components/common/SyncStateBadge";

type Props = {
  items: TestCase[];
};

export function TestCasesTable({ items }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-cyan-950">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-cyan-900">
            <th className="px-4 py-3 text-left">Title</th>

            <th className="px-4 py-3 text-left">Status</th>

            <th className="px-4 py-3 text-left">Flaky</th>

            <th className="px-4 py-3 text-left">Sync State</th>
          </tr>
        </thead>

        <tbody>
          {items.map((testCase) => (
            <tr
              key={testCase.id}
              className={`border-b ${testCase.syncState === "STALE" ? "bg-yellow-50" : ""}`}
            >
              <td className="px-4 py-3">
                <Link
                  href={`/test-cases/${testCase.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {testCase.title}
                </Link>
              </td>

              <td className="px-4 py-3">
                <StatusBadge status={testCase.lastStatus} />
              </td>

              <td className="px-4 py-3">{testCase.isFlaky ? "Yes" : "No"}</td>

              <td className="px-4 py-3">
                <SyncStateBadge state={testCase.syncState} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
