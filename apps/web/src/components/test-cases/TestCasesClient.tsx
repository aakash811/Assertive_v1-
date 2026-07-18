"use client";

import { TestCasesToolbar } from "./TestCasesToolbar";
import { TestCasesTable } from "./TestCasesTable";
import type { TestCase } from "@/types/test-case";
import { TestCasesSort } from "./TestCasesSort";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, PageHeader } from "@/components/common/ui";

type Props = {
  items: TestCase[];
  page: number;
  q: string;
  status: string;
  owner: string;
  tag: string;
  type: string;
  priority: string;
  syncState: string;
  flaky: boolean;
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
  owner,
  tag,
  type,
  priority,
  syncState,
  flaky,
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
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const start =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);
  const totalPages = Math.max(
    1,
    Math.ceil(pagination.total / pagination.limit),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Test Cases"
        description="Search, filter, and inspect the synced test inventory."
      />

      <TestCasesToolbar
        search={q}
        status={status}
        owner={owner}
        tag={tag}
        type={type}
        priority={priority}
        syncState={syncState}
        flaky={flaky}
        onSearch={(value) => updateParam("q", value)}
        onStatus={(value) => updateParam("status", value)}
        onOwner={(value) => updateParam("owner", value)}
        onTag={(value) => updateParam("tag", value)}
        onType={(value) => updateParam("type", value)}
        onPriority={(value) => updateParam("priority", value)}
        onSyncState={(value) => updateParam("syncState", value)}
        onFlaky={(value) => updateParam("flaky", value ? "true" : "")}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted">
          {pagination.total} test cases
        </div>
        <TestCasesSort
          value={sort}
          onChange={(value) => updateParam("sort", value)}
        />
      </div>

      <TestCasesTable items={items} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          disabled={page === 1}
          onClick={() => updateParam("page", String(page - 1))}
        >
          Previous
        </Button>

        <div className="text-center text-sm text-muted">
          Page {page} of {totalPages} · Showing {start}-{end} of{" "}
          {pagination.total}
        </div>

        <Button
          disabled={page === totalPages}
          onClick={() => updateParam("page", String(page + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
