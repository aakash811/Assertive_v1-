type props = {
  state: string;
};

export function SyncStateBadge({ state }: props) {
  const normalized = (state || "").toUpperCase();
  const styles: Record<string, string> = {
    SYNCED:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    STALE:
      "border-slate-500/20 bg-slate-500/5 text-slate-500 dark:text-slate-400",
  };

  return (
    <span
      className={`inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-medium transition-colors ${
        styles[normalized] ?? styles.STALE
      }`}
    >
      {normalized}
    </span>
  );
}
