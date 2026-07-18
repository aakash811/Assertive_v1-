import {
  getAnalyticsSummary,
  getMostFailingTests,
  getSlowestTests,
  getFlakyTests,
  getStatusDistribution,
} from "@/lib/api";
import Link from "next/link";
import { AnalyticsTable } from "@/components/analytics/AnalyticsTable";
import { StatusPieChart } from "@/components/analytics/StatusPieChart";
import { PassRateChart } from "@/components/analytics/PassRateChart";
import { FailureChart } from "@/components/analytics/FailureChart";
import { FailureItem, FlakyTest, SlowTest } from "@/types/analytics";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { EmptyState, PageHeader } from "@/components/common/ui";

export default async function AnalyticsPage() {
  const [summary, failures, slowest, flaky, statusDistribution] =
    await Promise.all([
      getAnalyticsSummary(),
      getMostFailingTests(),
      getSlowestTests(),
      getFlakyTests(),
      getStatusDistribution(),
    ]);

  const data = summary.summary;
  if (data.totalTests === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Analytics"
          description="Inspect aggregate pass rate, failure rate, and test health trends."
        />
        <EmptyState
          title="No analytics available"
          description="Analytics will appear after your first run batch is synced."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Inspect aggregate pass rate, failure rate, and test health trends."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Tests" value={data.totalTests} />

        <MetricCard title="Total Runs" value={data.totalRuns} />

        <MetricCard title="Pass Rate" value={`${data.passRate}%`} />

        <MetricCard title="Failure Rate" value={`${data.failureRate ?? 0}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PassRateChart passRate={data.passRate} />

        <FailureChart failureRate={data.failureRate ?? 0} />
      </div>

      <StatusPieChart data={statusDistribution} />

      <div className="grid gap-6 lg:grid-cols-3">
        <AnalyticsTable
          title="Most Failing Tests"
          rows={failures.map((item: FailureItem) => ({
            name: item.title,
            value: item.failures,
          }))}
        />

        <AnalyticsTable
          title="Slowest Tests"
          rows={slowest.map((item: SlowTest) => ({
            name: item.title,
            value: `${item.averageDuration} ms`,
          }))}
        />

        <AnalyticsTable
          title="Flaky Tests"
          rows={flaky.map((item: FlakyTest) => ({
            name: item.title,
            value: item.flakyScore,
          }))}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/test-cases?status=FAILED"
          className="rounded-lg border border-gray-200 bg-white p-4 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50"
        >
          Failed Tests
        </Link>

        <Link
          href="/test-cases?flaky=true"
          className="rounded-lg border border-gray-200 bg-white p-4 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50"
        >
          Flaky Tests
        </Link>

        <Link
          href="/test-cases?syncState=STALE"
          className="rounded-lg border border-gray-200 bg-white p-4 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50"
        >
          Stale Tests
        </Link>
      </div>
    </div>
  );
}
