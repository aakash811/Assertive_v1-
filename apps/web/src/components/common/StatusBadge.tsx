type Props = {
  status: string;
};

export function StatusBadge({ status }: Props) {
  const normalized = (status || "").toUpperCase();
  const styles: Record<string, string> = {
    PASSED:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    FAILED:
      "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
    SKIPPED:
      "border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-400",
    UNKNOWN:
      "border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-400",
  };

  return (
    <span
      className={`inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-medium transition-colors ${
        styles[normalized] ?? styles.UNKNOWN
      }`}
    >
      {normalized}
    </span>
  );
}
