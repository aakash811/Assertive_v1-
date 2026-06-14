type MetricCardProps = {
  title: string;
  value: string | number;
};

export function MetricCard({ title, value }: MetricCardProps) {
  return (
    <div className="rounded-lg border bg-amber-200 p-6 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>

      <p className="mt-2 text-3xl font-bold text-green-700">{value}</p>
    </div>
  );
}
