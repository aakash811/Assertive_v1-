type MetricCardProps = {
  title: string;
  value: string | number;
  helper?: string;
  trend?: "up" | "down" | "neutral";
};

export function MetricCard({ title, value, helper, trend }: MetricCardProps) {
  const displayValue =
    value === null || value === undefined || value === "" ? "-" : value;

  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "";

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-surface-raised p-5 shadow-sm transition-all hover:shadow-md hover:border-accent/20">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted">{title}</p>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend === "up"
                ? "text-emerald-500"
                : trend === "down"
                  ? "text-red-500"
                  : "text-muted"
            }`}
          >
            {trendIcon}
          </span>
        )}
      </div>

      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground tabular-nums">
        {displayValue}
      </p>
      {helper ? (
        <p className="mt-1.5 text-xs text-muted">{helper}</p>
      ) : null}

      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
