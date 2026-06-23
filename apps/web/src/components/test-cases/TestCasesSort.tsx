"use client";

type Props = {
  value: string;

  onChange: (value: string) => void;
};

export function TestCasesSort({
  value,

  onChange,
}: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border px-3 py-2"
    >
      <option value="updated">Recently Updated</option>

      <option value="title">Title (A-Z)</option>

      <option value="failed">Failed First</option>

      <option value="flaky">Flaky First</option>
    </select>
  );
}
