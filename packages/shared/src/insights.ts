export interface SummaryMetrics {
  totalTests: number;
  totalRuns: number;
  passedRuns: number;
  failedRuns: number;
  staleRuns: number;

  passRate: number;
  failureRate?: number;
}

export interface TrendPoint {
  createdAt: Date;
  passRate: number;
}
