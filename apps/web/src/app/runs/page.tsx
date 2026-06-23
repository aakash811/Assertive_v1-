import { getRunBatches } from "@/lib/api";
import { RunBatchesClient } from "@/components/run-batches/RunBatchesClient";

type Props = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    environment?: string;
    triggeredBy?: string;
  }>;
};

export default async function RunsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const runBatches = await getRunBatches({
    page,
    q: params.q,
    environment: params.environment,
    triggeredBy: params.triggeredBy,
  });

  return (
    <RunBatchesClient
      items={runBatches.items}
      page={page}
      total={runBatches.pagination.total}
      limit={runBatches.pagination.limit}
      q={params.q ?? ""}
      environment={params.environment ?? ""}
      triggeredBy={params.triggeredBy ?? ""}
    />
  );
}
