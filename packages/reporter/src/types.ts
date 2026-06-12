export interface RunBatchPayload {
  branch?: string;
  environment?: string;
}

export interface TestRunPayload {
  testCaseId: string;
  runBatchId: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  durationMs?: number;
}
