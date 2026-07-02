export type AnalyticsSummary = {
  totalTests: number;
  totalRuns: number;
  flakyTests: number;
  staleRuns: number;
  passedRuns: number;
  failedRuns: number;
  passRate: number;
  failureRate: number;
};

export type StatusDistibution = {
  name: string;
  value: number;
};

export type FailureItem = {
  title: string;
  failures: number;
};

export type SlowTest = {
  title: string;
  averageDuration: number;
};

export type FlakyTest = {
  id: string;
  title: string;
  flakyScore: number;
};

export type RecentFailure = {
  id: string;
  title: string;
  createdAt: string;
  runBatchId: string;
  branch?: string | null;
};
