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
      aria-label="Sort test cases"
      className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm hover:bg-gray-50 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900 dark:focus:ring-blue-950"
    >
      <option value="updated">Recently Updated</option>

      <option value="title">Title (A-Z)</option>

      <option value="failed">Failed First</option>

      <option value="flaky">Flaky First</option>
    </select>
  );
}
