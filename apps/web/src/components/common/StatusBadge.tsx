type Props = {
  status: string;
};

export function StatusBadge({ status }: Props) {
  const styles = {
    PASSED:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
    FAILED:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300",
    SKIPPED:
      "border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300",
    UNKNOWN:
      "border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-400",
  };

  return (
    <span
      className={`inline-flex h-6 items-center rounded-full border px-2 text-xs font-medium ${
        styles[status as keyof typeof styles] ?? styles.UNKNOWN
      }`}
    >
      {status}
    </span>
  );
}
