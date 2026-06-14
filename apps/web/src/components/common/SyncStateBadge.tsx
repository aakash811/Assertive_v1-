type props = {
  state: string;
};

export function SyncStateBadge({ state }: props) {
  const styles = {
    SYNCED: "bg-green-100 text-green-700",
    STALE: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${
        styles[state as keyof typeof styles] ?? styles.STALE
      }`}
    >
      {state}
    </span>
  );
}
