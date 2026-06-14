export type RunResult = {
  id: string;
  status: string;
  durationMs?: number | null;
  traceUrl?: string | null;
  testCaseId: string;
  testCase?: {
    title: string;
  };
  attemptNumber?: number | null;
};
