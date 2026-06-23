"use client";

type Props = {
  search?: string;
  status?: string;
  onSearch: (value: string) => void;
  onStatus: (value: string) => void;
};

export function TestCasesToolbar({
  search,
  status,
  onSearch,
  onStatus,
}: Props) {
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search tests..."
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

        <option value="STALE">Stale</option>

        <option value="SKIPPED">Skipped</option>

        <option value="UNKNOWN">Unknown</option>
      </select>
    </div>
  );
}
