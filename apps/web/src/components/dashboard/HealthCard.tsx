type Props = {
  passRate: number;
};

export function HealthCard({ passRate }: Props) {
  let label = "Healthy";
  let tone =
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300";
  let description = "Most tests are passing.";

  if (passRate < 70) {
    label = "Critical";
    tone =
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300";
    description = "Failure rate needs attention.";
  } else if (passRate < 90) {
    label = "Degraded";
    tone =
      "border-gray-300 bg-gray-50 text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200";
    description = "Pass rate is below the target range.";
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            System Health
          </div>
          <div className="mt-1 text-lg font-semibold text-gray-950 dark:text-gray-50">
            {description}
          </div>
        </div>
        <span
          className={`inline-flex h-7 items-center rounded-full border px-3 text-sm font-medium ${tone}`}
        >
          {label}
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          className={passRate < 70 ? "h-full bg-red-600" : "h-full bg-blue-600"}
          style={{ width: `${Math.max(0, Math.min(100, passRate))}%` }}
        />
      </div>
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {passRate}% pass rate
      </div>
    </div>
  );
}
