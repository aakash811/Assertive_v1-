type Props = {
  q: string;
  environment: string;
  triggeredBy: string;
  onQ: (value: string) => void;
  onEnvironment: (value: string) => void;
  onTriggeredBy: (value: string) => void;
};

export function RunBatchesToolbar({
  q,
  environment,
  triggeredBy,
  onQ,
  onEnvironment,
  onTriggeredBy,
}: Props) {
  const controlClass =
    "h-9 rounded-lg border border-border bg-surface-raised px-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted hover:bg-surface focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

  return (
    <div className="rounded-xl border border-border bg-surface-raised p-3 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_180px_180px]">
      <input
        value={q}
        onChange={(e) => onQ(e.target.value)}
        placeholder="Search branch or commit"
        aria-label="Search run batches"
        className={controlClass}
      />

      <input
        value={environment}
        onChange={(e) => onEnvironment(e.target.value)}
        placeholder="Environment"
        aria-label="Filter by environment"
        className={controlClass}
      />

      <input
        value={triggeredBy}
        onChange={(e) => onTriggeredBy(e.target.value)}
        placeholder="Triggered By"
        aria-label="Filter by triggered by"
        className={controlClass}
      />
      </div>
    </div>
  );
}
