import { EmptyState, SectionCard } from "@/components/common/ui";

type Row = {
  name: string;
  value: string | number;
};

type Props = {
  title: string;
  rows: Row[];
};

export function AnalyticsTable({ title, rows }: Props) {
  if (!rows.length) {
    return (
      <EmptyState
        title={`No ${title.toLowerCase()}`}
        description="Analytics will populate after runs are synced."
      />
    );
  }

  return (
    <SectionCard title={title}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-900 dark:text-gray-400">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Test</th>
              <th className="px-5 py-3 text-right font-medium">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {rows.map((row) => (
              <tr key={row.name} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                <td className="max-w-0 truncate px-5 py-3 font-medium text-gray-900 dark:text-gray-100">
                  {row.name}
                </td>

                <td className="whitespace-nowrap px-5 py-3 text-right text-gray-600 dark:text-gray-400">
                  {row.value || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
