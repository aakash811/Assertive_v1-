type MetricCardProps = {
  title: string;
  value: string | number;
  helper?: string;
};

export function MetricCard({ title, value, helper }: MetricCardProps) {
  const displayValue =
    value === null || value === undefined || value === "" ? "-" : value;

  return (
    <div className="min-h-28 rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {title}
      </p>

      <p className="mt-3 text-2xl font-semibold tracking-tight text-gray-950 dark:text-gray-50">
        {displayValue}
      </p>
      {helper ? (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {helper}
        </p>
      ) : null}
    </div>
  );
}
