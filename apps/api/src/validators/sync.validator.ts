import { z } from "zod";
import type { SyncTestCase } from "@assertive/shared";

const customFieldsSchema = z.record(z.string(), z.string());

export const syncTestCaseSchema = z.object({
  externalId: z.string().min(1),
  title: z.string().min(1),
  filePath: z.string().min(1),
  owner: z.string().optional(),
  priority: z.string().optional(),
  testType: z.string().optional(),
  suite: z.string().optional(),
  tags: z.array(z.string()).default([]),
  customFields: customFieldsSchema.default({}),
}) as z.ZodType<SyncTestCase>;

export const syncPayloadSchema = z.object({
  testCases: z.array(syncTestCaseSchema).min(1, "At least one test case is required"),
});

export type SyncPayload = z.infer<typeof syncPayloadSchema>;
