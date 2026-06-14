import { MetricCard } from "@/components/dashboard/MetricCard";
import { getMetricsSummary } from "@/lib/api";

export default async function DashboardPage() {
  const metrics = await getMetricsSummary();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Tests" value={metrics.totalTests} />

        <MetricCard title="Total Runs" value={metrics.totalRuns} />

        <MetricCard title="Stale Tests" value={metrics.staleTests} />

        <MetricCard title="Flaky Tests" value={metrics.flakyTests} />

        <MetricCard title="Pass Rate" value={`${metrics.passRate}%`} />
      </div>
    </div>
  );
}
