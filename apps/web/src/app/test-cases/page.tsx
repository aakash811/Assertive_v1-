import { getTestCases } from "@/lib/api";
import { TestCasesClient } from "@/components/test-cases/TestCasesClient";

type Props = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
    owner?: string;
    tag?: string;
    type?: string;
    priority?: string;
    syncState?: string;
    flaky?: string;
    sort?: string;
  }>;
};

export default async function TestCasesPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const testCases = await getTestCases({
    page,
    q: params.q,
    status: params.status,
    owner: params.owner,
    tag: params.tag,
    type: params.type,
    priority: params.priority,
    syncState: params.syncState as "SYNCED" | "STALE" | undefined,
    flaky: params.flaky === "true",
  });

  return (
    <TestCasesClient
      items={testCases.items}
      page={page}
      q={params.q ?? ""}
      status={params.status ?? ""}
      owner={params.owner ?? ""}
      tag={params.tag ?? ""}
      type={params.type ?? ""}
      priority={params.priority ?? ""}
      syncState={params.syncState ?? ""}
      flaky={params.flaky === "true"}
      sort={params.sort ?? "updated"}
      pagination={testCases.pagination}
    />
  );
}
