import type { PaginatedData } from "./api";
import type { RunResult } from "./run-result";

export type RunBatch = {
  id: string;
  branch?: string | null;
  commitSha?: string | null;
  environment?: string | null;
  totalCount: number;
  passedCount: number;
  failedCount: number;
  skippedCount: number;
  createdAt: string;
  triggeredBy?: string | null;
  runs?: RunResult[];
};

export type RunBatchResponse = PaginatedData<RunBatch>;
