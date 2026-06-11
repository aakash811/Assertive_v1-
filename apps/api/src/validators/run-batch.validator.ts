import { z } from "zod";

export const createRunBatchSchema = z.object({
  branch: z.string().optional(),
  commitSha: z.string().optional(),
  environment: z.string().optional(),
  triggeredBy: z.string().optional(),
  ciBuildId: z.string().optional(),
  ciBuildUrl: z.string().optional(),
});
