import { z } from "zod";

export const createTestCaseSchema = z.object({
  externalId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  owner: z.string().optional(),
  priority: z.string().optional(),
  testType: z.string().optional(),
  suiteId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateTestCaseSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
});

