export interface RunBatchPayload {
  branch: string;
  environment: string;
  commitSha?: string;
  ciBuildId?: string;
  ciBuildUrl?: string;
  triggeredBy?: string;
}

export interface TestRunPayload {
  testCaseId: string;
  runBatchId: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
  durationMs?: number;
}

export interface TestMetadata {
  owner?: string;
  priority?: string;
  tags?: string[];
  suite?: string;
}

export interface BatchResult {
  uniqueId: string;
  status: string;
  durationMs?: number;
  errorMessage?: string;
  errorStack?: string;
  traceUrl?: string | null;
  browser?: string;
  os?: string;
  retryOf?: number;
  attemptNumber?: number;
}

export interface TraceUploadResponse {
  uploadUrl: string;
  traceKey: string;
  traceUrl: string;
}
