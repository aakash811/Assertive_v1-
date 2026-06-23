import { HistoryTimeline } from "@/components/test-cases/HistoryTimeline";
import { MetadataPanel } from "@/components/test-cases/MetadataPanel";
import { RecentRuns } from "@/components/test-cases/RecentRuns";
import { TagsPanel } from "@/components/test-cases/TagsPanel";
import { OverrideStatusModal } from "@/components/test-cases/OverrideStatusModal";
import { getTestCase } from "@/lib/api";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TestCasePage({ params }: Props) {
  const { id } = await params;
  const testCase = await getTestCase(id);
  const history = testCase.history ?? [];
  console.log(JSON.stringify(history, null, 2));
  const runs = testCase.runs ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{testCase.title}</h1>

        <p className="text-gray-500">{testCase.uniqueId}</p>
      </div>

      <OverrideStatusModal testCaseId={id} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <div>Status</div>

          <div className="mt-2 text-xl font-semibold">
            {testCase.lastStatus}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div>Flaky</div>

          <div className="mt-2 text-xl font-semibold">
            {testCase.isFlaky ? "Yes" : "No"}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div>Sync State</div>

          <div className="mt-2 text-xl font-semibold">{testCase.syncState}</div>
        </div>

        <div className="rounded-lg border p-4">
          <div>Priority</div>

          <div className="mt-2 text-xl font-semibold">
            {testCase.priority ?? "-"}
          </div>
        </div>
      </div>

      <MetadataPanel testCase={testCase} />
      <TagsPanel tags={testCase.tags ?? []} />
      <RecentRuns items={runs} />
      <HistoryTimeline items={history} />
    </div>
  );
}
