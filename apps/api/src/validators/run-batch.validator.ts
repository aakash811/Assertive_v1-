import { z } from "zod";

export type CreateRunBatchDto = {
  branch?: string;
  environment?: string;
  commitSha?: string;
  ciBuildId?: string;
  ciBuildUrl?: string;
};

export type BatchUploadResult = {
  externalId: string;
  status: string;
  durationMs?: number;
  errorMessage?: string;
  traceUrl?: string;
};

export const createRunBatchSchema = z.object({
  branch: z.string().optional(),
  commitSha: z.string().optional(),
  environment: z.string().optional(),
  triggeredBy: z.string().optional(),
  ciBuildId: z.string().optional(),
  ciBuildUrl: z.string().optional(),
  traceUrl: z.string().optional(),
});

export const uploadResultsSchema = z.object({
  results: z.array(
    z.object({
      externalId: z.string(),
      status: z.enum(["PASSED", "FAILED", "SKIPPED"]),
      durationMs: z.number().optional(),
      errorMessage: z.string().optional(),
      traceUrl: z.string().optional(),
    }),
  ),
});
