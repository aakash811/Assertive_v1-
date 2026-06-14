"use client";

import { useState } from "react";
import { TestCasesTable } from "./TestCasesTable";
import { TestCase } from "@/types/test-case";

type Props = {
  items: TestCase[];
};

export function TestCasesClient({ items }: Props) {
  const [syncState, setSyncState] = useState("");

  const filtered = items.filter((testCase) => {
    if (syncState && testCase.syncState !== syncState) {
      return false;
    }

    return true;
  });

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Test Cases</h1>

      <select
        value={syncState}
        onChange={(e) => setSyncState(e.target.value)}
        className="mb-4 rounded border p-2"
      >
        <option value="">All</option>

        <option value="SYNCED">Synced</option>

        <option value="STALE">Stale</option>
      </select>

      <TestCasesTable items={filtered} />
    </div>
  );
}
