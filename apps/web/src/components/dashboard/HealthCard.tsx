type Props = {
  passRate: number;
};

export function HealthCard({ passRate }: Props) {
  let label = "Healthy";
  let emoji = "🟢";
  let color = "text-green-600";

  if (passRate < 70) {
    label = "Critical";
    emoji = "🔴";
    color = "text-red-600";
  } else if (passRate < 90) {
    label = "Warning";
    emoji = "🟡";
    color = "text-yellow-600";
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="text-sm text-gray-500">System Health</div>

      <div className={`mt-2 text-2xl font-bold ${color}`}>
        {emoji} {label}
      </div>

      <div className="mt-1 text-sm text-gray-500">{passRate}% pass rate</div>
    </div>
  );
}
