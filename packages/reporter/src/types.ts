export interface RunBatchPayload {
  branch: string;
  environment: string;
  commitSha?: string;
  ciBuildId?: string;
  ciBuildUrl?: string;
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
  traceUrl?: string | null;
}

export interface TraceUploadResponse {
  uploadUrl: string;
  traceKey: string;
  traceUrl: string;
}
