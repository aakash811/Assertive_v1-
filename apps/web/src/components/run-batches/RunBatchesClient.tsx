"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RunBatch } from "@/types/run-batch";
import { RunBatchesToolbar } from "./RunBatchesToolbar";
import { RunBatchesTable } from "./RunBatchesTable";
import { Button, PageHeader } from "@/components/common/ui";
import { MetricCard } from "@/components/dashboard/MetricCard";

type Props = {
  items: RunBatch[];
  page: number;
  total: number;
  limit: number;
  q: string;
  environment: string;
  triggeredBy: string;
};

export function RunBatchesClient({
  items,
  page,
  total,
  limit,
  q,
  environment,
  triggeredBy,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Run Batches"
        description="Inspect synced Playwright run batches and execution metadata."
      />

      <RunBatchesToolbar
        q={q}
        environment={environment}
        triggeredBy={triggeredBy}
        onQ={(value) => updateParam("q", value)}
        onEnvironment={(value) => updateParam("environment", value)}
        onTriggeredBy={(value) => updateParam("triggeredBy", value)}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Batches" value={total} />
        <MetricCard
          title="Environments"
          value={new Set(items.map((i) => i.environment).filter(Boolean)).size}
        />
        <MetricCard
          title="Triggered By"
          value={new Set(items.map((i) => i.triggeredBy).filter(Boolean)).size}
        />
        <MetricCard
          title="Branches"
          value={new Set(items.map((i) => i.branch).filter(Boolean)).size}
        />
      </div>

      <RunBatchesTable items={items} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          disabled={page === 1}
          onClick={() => updateParam("page", String(page - 1))}
        >
          Previous
        </Button>

        <span className="text-center text-sm text-gray-500">
          Page {page} of {totalPages} · Showing {start}-{end} of {total}
        </span>

        <Button
          disabled={page >= totalPages}
          onClick={() => updateParam("page", String(page + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
