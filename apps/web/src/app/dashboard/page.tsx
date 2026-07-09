import { PassRateChart } from "@/components/analytics/PassRateChart";

import { FailureChart } from "@/components/analytics/FailureChart";

import { StatusPieChart } from "@/components/analytics/StatusPieChart";

import { AnalyticsTable } from "@/components/analytics/AnalyticsTable";

import {
  getMostFailingTests,
  getSlowestTests,
  getFlakyTests,
  getStatusDistribution,
  getMetricsSummary,
  getRunBatches,
  getRecentFailures,
} from "@/lib/api";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RunBatchesTable } from "@/components/run-batches/RunBatchesTable";
import { HealthCard } from "@/components/dashboard/HealthCard";
import { RecentFailures } from "@/components/dashboard/RecentFailures";
import { EmptyState, PageHeader } from "@/components/common/ui";

export default async function DashboardPage() {
  const [
    metrics,
    failures,
    slowest,
    flaky,
    status,
    runBatches,
    recentFailures,
  ] = await Promise.all([
    getMetricsSummary(),
    getMostFailingTests(),
    getSlowestTests(),
    getFlakyTests(),
    getStatusDistribution(),
    getRunBatches({
      page: 1,
      limit: 5,
    }),
    getRecentFailures(),
  ]);
  if (metrics.totalTests === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="A live overview of synced test inventory, runs, and failures."
        />

        <EmptyState
          title="No analytics yet"
          description="Run your first Playwright sync with the Assertive reporter to populate dashboard metrics."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="A live overview of synced test inventory, runs, and failures."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard title="Total Tests" value={metrics.totalTests} />

        <MetricCard title="Total Runs" value={metrics.totalRuns} />

        <MetricCard title="Stale Runs" value={metrics.staleRuns} />

        <MetricCard title="Flaky Tests" value={metrics.flakyTests} />

        <MetricCard title="Pass Rate" value={`${metrics.passRate}%`} />
      </div>

      <HealthCard passRate={metrics.passRate} />

      <RecentFailures items={recentFailures} />

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-gray-950">
          Recent Run Batches
        </h2>
        <RunBatchesTable items={runBatches.items} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PassRateChart passRate={metrics.passRate} />

        <FailureChart failureRate={100 - metrics.passRate} />

        <StatusPieChart
          data={status.map((item) => ({
            name: item.name,
            value: item.value,
          }))}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <AnalyticsTable
          title="Most Failing Tests"
          rows={failures.map((item) => ({
            name: item.title,
            value: item.failures,
          }))}
        />

        <AnalyticsTable
          title="Slowest Tests"
          rows={slowest.map((item) => ({
            name: item.title,
            value: `${item.averageDuration} ms`,
          }))}
        />

        <AnalyticsTable
          title="Flaky Tests"
          rows={flaky.map((item) => ({
            name: item.title,
            value: `${item.flakyScore}%`,
          }))}
        />
      </div>
    </div>
  );
}
