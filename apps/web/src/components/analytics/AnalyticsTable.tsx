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
      <div className="rounded-lg border p-8 text-center">No data available</div>
    );
  }
  return (
    <div className="rounded-lg border bg-amber-300 p-4">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.name} className="flex justify-between border-b py-2">
            <span>{row.name}</span>

            <span>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
