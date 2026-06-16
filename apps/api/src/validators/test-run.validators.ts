import { z } from "zod";

export const createTestRunSchema = z.object({
  testCaseId: z.string(),
  runBatchId: z.string(),
  status: z.enum(["PASSED", "FAILED", "SKIPPED", "UNKNOWN"]),
  durationMs: z.number().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  traceUrl: z.string().optional(),
  errorMessage: z.string().optional(),
  errorStack: z.string().optional(),
});
