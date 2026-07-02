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
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search title or ID..."
        className="rounded-md border px-3 py-2"
      />

      <select
        value={status}
        onChange={(e) => onStatus(e.target.value)}
        className="rounded-md border px-3 py-2"
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
        className="rounded-md border px-3 py-2"
      />

      <input
        value={tag}
        onChange={(e) => onTag(e.target.value)}
        placeholder="Tag"
        className="rounded-md border px-3 py-2"
      />

      <select
        value={type}
        onChange={(e) => onType(e.target.value)}
        className="rounded-md border px-3 py-2"
      >
        <option value="">All Types</option>
        <option value="unit">Unit</option>
        <option value="integration">Integration</option>
        <option value="e2e">E2E</option>
      </select>

      <select
        value={priority}
        onChange={(e) => onPriority(e.target.value)}
        className="rounded-md border px-3 py-2"
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
        className="rounded-md border px-3 py-2"
      >
        <option value="">All Sync States</option>
        <option value="SYNCED">Synced</option>
        <option value="STALE">Stale</option>
      </select>

      <label className="flex items-center gap-2 rounded-md border px-3 py-2">
        <input
          type="checkbox"
          checked={flaky}
          onChange={(e) => onFlaky(e.target.checked)}
        />
        Flaky only
      </label>
    </div>
  );
}
