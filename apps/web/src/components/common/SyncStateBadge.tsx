type props = {
  state: string;
};

export function SyncStateBadge({ state }: props) {
  const styles = {
    SYNCED:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
    STALE:
      "border-gray-300 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300",
  };

  return (
    <span
      className={`inline-flex h-6 items-center rounded-full border px-2 text-xs font-medium ${
        styles[state as keyof typeof styles] ?? styles.STALE
      }`}
    >
      {state}
    </span>
  );
}
