"use client";

import { useMemo, useState } from "react";
import { TestCasesToolbar } from "./TestCasesToolbar";
import { TestCasesTable } from "./TestCasesTable";
import type { TestCase } from "@/types/test-case";
import { TestCasesSort } from "./TestCasesSort";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  items: TestCase[];
  page: number;
  q: string;
  status: string;
  sort: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};

export function TestCasesClient({
  items,
  page,
  q,
  status,
  sort,
  pagination,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    if (key !== "page") {
      params.set("page", "1");
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  const totalPages = Math.max(
    1,
    Math.ceil(pagination.total / pagination.limit),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Test Cases</h1>

      <TestCasesToolbar
        search={q}
        status={status}
        onSearch={(value) => updateParam("q", value)}
        onStatus={(value) => updateParam("status", value)}
      />

      <TestCasesSort
        value={sort}
        onChange={(value) => updateParam("sort", value)}
      />

      <div className="text-sm text-muted-foreground">
        {pagination.total} test cases
      </div>

      <TestCasesTable items={items} />
      <div className="flex items-center justify-between">
        <button
          disabled={page === 1}
          onClick={() => updateParam("page", String(page - 1))}
          className="rounded border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← Previous
        </button>

        <div className="text-sm text-gray-500">
          Page {page} of {totalPages}
        </div>

        <button
          disabled={page === totalPages}
          onClick={() => updateParam("page", String(page + 1))}
          className="rounded border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
