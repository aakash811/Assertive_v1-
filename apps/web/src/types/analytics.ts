export type AnalyticsSummary = {
  totalTests: number;
  totalRuns: number;
  passedRuns: number;
  failedRuns: number;
  passRate: number;
  failureRate: number;
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
