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
} from "@/lib/api";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RunBatchesTable } from "@/components/run-batches/RunBatchesTable";

export default async function DashboardPage() {
  const [metrics, failures, slowest, flaky, status, runBatches] =
    await Promise.all([
      getMetricsSummary(),
      getMostFailingTests(),
      getSlowestTests(),
      getFlakyTests(),
      getStatusDistribution(),
      getRunBatches({
        page: 1,
        limit: 5,
      }),
    ]);
  if (metrics.totalTests === 0) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="rounded-lg border p-8 text-center">
          No test data available yet.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard title="Total Tests" value={metrics.totalTests} />

        <MetricCard title="Total Runs" value={metrics.totalRuns} />

        <MetricCard title="Stale Runs" value={metrics.staleRuns} />

        <MetricCard title="Flaky Tests" value={metrics.flakyTests} />

        <MetricCard title="Pass Rate" value={`${metrics.passRate}%`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <PassRateChart passRate={metrics.passRate} />

        <FailureChart failureRate={100 - metrics.passRate} />
      </div>
      <StatusPieChart
        data={status.map((item) => ({
          name: item.name,
          value: item.value,
        }))}
      />
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
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Recent Run Batches</h2>
        <RunBatchesTable items={runBatches.items} />
      </div>
    </div>
  );
}
