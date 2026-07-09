"use client";

type Props = {
  search?: string;
  status?: string;
  owner?: string;
  tag?: string;
  type?: string;
  priority?: string;
  syncState?: string;
  flaky?: boolean;

  onSearch: (value: string) => void;
  onStatus: (value: string) => void;
  onOwner: (value: string) => void;
  onTag: (value: string) => void;
  onType: (value: string) => void;
  onPriority: (value: string) => void;
  onSyncState: (value: string) => void;
  onFlaky: (value: boolean) => void;
};

export function TestCasesToolbar({
  search = "",
  status = "",
  owner = "",
  tag = "",
  type = "",
  priority = "",
  syncState = "",
  flaky = false,
  onSearch,
  onStatus,
  onOwner,
  onTag,
  onType,
  onPriority,
  onSyncState,
  onFlaky,
}: Props) {
  const controlClass =
    "h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 hover:bg-gray-50 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:hover:bg-gray-900 dark:focus:ring-blue-950";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.5fr)_repeat(6,minmax(120px,1fr))_auto]">
      <input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search title or ID..."
        aria-label="Search test cases"
        className={controlClass}
      />

      <select
        value={status}
        onChange={(e) => onStatus(e.target.value)}
        aria-label="Filter by status"
        className={controlClass}
      >
        <option value="">All Status</option>
        <option value="PASSED">Passed</option>
        <option value="FAILED">Failed</option>
        <option value="SKIPPED">Skipped</option>
        <option value="STALE">Stale</option>
        <option value="UNKNOWN">Unknown</option>
      </select>

      <input
        value={owner}
        onChange={(e) => onOwner(e.target.value)}
        placeholder="Owner"
        aria-label="Filter by owner"
        className={controlClass}
      />

      <input
        value={tag}
        onChange={(e) => onTag(e.target.value)}
        placeholder="Tag"
        aria-label="Filter by tag"
        className={controlClass}
      />

      <select
        value={type}
        onChange={(e) => onType(e.target.value)}
        aria-label="Filter by type"
        className={controlClass}
      >
        <option value="">All Types</option>
        <option value="unit">Unit</option>
        <option value="integration">Integration</option>
        <option value="e2e">E2E</option>
      </select>

      <select
        value={priority}
        onChange={(e) => onPriority(e.target.value)}
        aria-label="Filter by priority"
        className={controlClass}
      >
        <option value="">All Priorities</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <select
        value={syncState}
        onChange={(e) => onSyncState(e.target.value)}
        aria-label="Filter by sync state"
        className={controlClass}
      >
        <option value="">All Sync States</option>
        <option value="SYNCED">Synced</option>
        <option value="STALE">Stale</option>
      </select>

      <label className="flex h-9 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300">
        <input
          type="checkbox"
          checked={flaky}
          onChange={(e) => onFlaky(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600"
        />
        Flaky only
      </label>
      </div>
    </div>
  );
}
