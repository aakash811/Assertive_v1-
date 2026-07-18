type Props = {
  current: number;
};

export function TrendCard({ current }: Props) {
  return (
    <div className="rounded-xl border border-border bg-surface-raised p-6 shadow-sm transition-all hover:shadow-md">
      <div className="text-sm text-muted">Pass Rate Trend</div>

      <div className="mt-2 text-2xl font-bold text-foreground">{current}%</div>
    </div>
  );
}
