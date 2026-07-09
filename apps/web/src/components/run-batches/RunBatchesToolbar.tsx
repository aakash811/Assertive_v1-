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
    "h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 hover:bg-gray-50 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:hover:bg-gray-900 dark:focus:ring-blue-950";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-950">
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
