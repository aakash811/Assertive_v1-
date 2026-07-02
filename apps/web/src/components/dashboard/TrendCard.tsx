type Props = {
  current: number;
};

export function TrendCard({ current }: Props) {
  return (
    <div className="rounded-lg border p-6">
      <div className="text-sm text-gray-500">Pass Rate Trend</div>

      <div className="mt-2 text-2xl font-bold">{current}%</div>
    </div>
  );
}
