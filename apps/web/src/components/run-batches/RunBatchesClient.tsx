"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RunBatch } from "@/types/run-batch";
import { RunBatchesToolbar } from "./RunBatchesToolbar";
import { RunBatchesTable } from "./RunBatchesTable";

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
      <h1 className="text-3xl font-bold">Run Batches</h1>

      <RunBatchesToolbar
        q={q}
        environment={environment}
        triggeredBy={triggeredBy}
        onQ={(value) => updateParam("q", value)}
        onEnvironment={(value) => updateParam("environment", value)}
        onTriggeredBy={(value) => updateParam("triggeredBy", value)}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded border p-4">
          Total Batches
          <div className="text-2xl font-bold">{total}</div>
        </div>

        <div className="rounded border p-4">
          Environments
          <div className="text-2xl font-bold">
            {new Set(items.map((i) => i.environment).filter(Boolean)).size}
          </div>
        </div>

        <div className="rounded border p-4">
          Triggered By
          <div className="text-2xl font-bold">
            {new Set(items.map((i) => i.triggeredBy).filter(Boolean)).size}
          </div>
        </div>

        <div className="rounded border p-4">
          Branches
          <div className="text-2xl font-bold">
            {new Set(items.map((i) => i.branch).filter(Boolean)).size}
          </div>
        </div>
      </div>

      <RunBatchesTable items={items} />

      <div className="flex items-center gap-4">
        <button
          disabled={page === 1}
          className="rounded border px-3 py-1 disabled:opacity-50"
          onClick={() =>
            updateParam(
              "page",

              String(page - 1),
            )
          }
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          className="rounded border px-3 py-1 disabled:opacity-50"
          onClick={() =>
            updateParam(
              "page",

              String(page + 1),
            )
          }
        >
          Next
        </button>
      </div>
    </div>
  );
}
