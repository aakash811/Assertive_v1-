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

export default async function AnalyticsPage() {
  const [summary, failures, slowest, flaky, statusDistribution] =
    await Promise.all([
      getAnalyticsSummary(),
      getMostFailingTests(),
      getSlowestTests(),
      getFlakyTests(),
      getStatusDistribution(),
    ]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Tests" value={summary.totalTests} />

        <MetricCard title="Total Runs" value={summary.totalRuns} />

        <MetricCard title="Pass Rate" value={`${summary.passRate}%`} />

        <MetricCard title="Failure Rate" value={`${summary.failureRate}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PassRateChart passRate={summary.passRate} />

        <FailureChart failureRate={summary.failureRate} />
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
          href="/test-cases"
          className="rounded-lg border p-4 hover:bg-gray-50"
        >
          Failed Tests
        </Link>

        <Link
          href="/test-cases"
          className="rounded-lg border p-4 hover:bg-gray-50"
        >
          Flaky Tests
        </Link>

        <Link
          href="/test-cases"
          className="rounded-lg border p-4 hover:bg-gray-50"
        >
          Stale Tests
        </Link>
      </div>
    </div>
  );
}
