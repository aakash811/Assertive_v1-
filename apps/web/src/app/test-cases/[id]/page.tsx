import { HistoryTimeline } from "@/components/test-cases/HistoryTimeline";
import { MetadataPanel } from "@/components/test-cases/MetadataPanel";
import { RecentRuns } from "@/components/test-cases/RecentRuns";
import { TagsPanel } from "@/components/test-cases/TagsPanel";
import { OverrideStatusModal } from "@/components/test-cases/OverrideStatusModal";
import { getTestCase } from "@/lib/api";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PageHeader } from "@/components/common/ui";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TestCasePage({ params }: Props) {
  const { id } = await params;
  const testCase = await getTestCase(id);
  const history = testCase.history ?? [];
  const runs = testCase.runs ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={testCase.title}
        description={testCase.externalId}
        actions={<OverrideStatusModal testCaseId={id} />}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard title="Status" value={testCase.lastStatus} />
        <MetricCard title="Flaky" value={testCase.isFlaky ? "Yes" : "No"} />
        <MetricCard title="Sync State" value={testCase.syncState} />
        <MetricCard title="Priority" value={testCase.priority ?? "-"} />
      </div>

      <MetadataPanel testCase={testCase} />
      <TagsPanel tags={testCase.tags ?? []} />
      <RecentRuns items={runs} />
      <HistoryTimeline items={history} />
    </div>
  );
}
