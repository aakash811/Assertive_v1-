import { z } from "zod";

export const createTestCaseSchema = z.object({
  uniqueId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
});

export const updateTestCaseSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const discoverTestCasesSchema = z.object({
  uniqueId: z.string().min(1),
  title: z.string().min(1),
});
