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
    "h-9 rounded-lg border border-border bg-surface-raised px-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted hover:bg-surface focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 dark:placeholder:text-muted";

  return (
    <div className="rounded-xl border border-border bg-surface-raised p-3 shadow-sm">
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

      <label className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface-raised px-3 text-sm text-foreground shadow-sm">
        <input
          type="checkbox"
          checked={flaky}
          onChange={(e) => onFlaky(e.target.checked)}
          className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
        />
        Flaky only
      </label>
      </div>
    </div>
  );
}
