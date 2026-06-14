type Props = {
  status: string;
};

export function StatusBadge({ status }: Props) {
  const styles = {
    PASSED: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
    SKIPPED: "bg-yellow-100 text-yellow-700",
    UNKNOWN: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${
        styles[status as keyof typeof styles] ?? styles.UNKNOWN
      }`}
    >
      {status}
    </span>
  );
}
