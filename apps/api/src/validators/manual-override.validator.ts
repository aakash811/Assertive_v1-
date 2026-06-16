import { z } from "zod";

export const manualOverrideValidator = z.object({
  status: z.enum(["PASSED", "FAILED", "SKIPPED", "UNKNOWN"]),
  comment: z.string().trim().min(3).max(500),
});
