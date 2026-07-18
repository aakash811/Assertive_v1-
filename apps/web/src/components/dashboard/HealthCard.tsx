type Props = {
  passRate: number;
};

export function HealthCard({ passRate }: Props) {
  let label = "Healthy";
  let description = "Most tests are passing.";
  let progressColor = "bg-emerald-500";
  let ringColor = "text-emerald-500";

  if (passRate < 70) {
    label = "Critical";
    description = "Failure rate needs attention.";
    progressColor = "bg-red-500";
    ringColor = "text-red-500";
  } else if (passRate < 90) {
    label = "Degraded";
    description = "Pass rate is below the target range.";
    progressColor = "bg-amber-500";
    ringColor = "text-amber-500";
  }

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, passRate)) / 100) * circumference;

  return (
    <div className="rounded-xl border border-border bg-surface-raised p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0">
            <svg className="h-16 w-16 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-200 dark:text-slate-700"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                className={ringColor}
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: offset,
                  transition: "stroke-dashoffset 0.6s ease-out",
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-semibold text-foreground">
                {Math.round(passRate)}%
              </span>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-muted">System Health</div>
            <div className="mt-1 text-base font-semibold text-foreground">
              {description}
            </div>
          </div>
        </div>

        <span
          className={`inline-flex h-7 items-center rounded-full border px-3 text-sm font-medium ${
            passRate < 70
              ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
              : passRate < 90
                ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
