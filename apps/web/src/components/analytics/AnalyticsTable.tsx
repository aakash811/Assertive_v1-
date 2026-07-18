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
          <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Test</th>
              <th className="px-5 py-3 text-right font-medium">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr
                key={row.name}
                className="transition-colors hover:bg-surface"
              >
                <td className="max-w-0 truncate px-5 py-3 font-medium text-foreground">
                  {row.name}
                </td>

                <td className="whitespace-nowrap px-5 py-3 text-right text-muted">
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
