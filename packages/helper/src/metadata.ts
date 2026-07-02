export const PRIORITIES = ["critical", "high", "medium", "low"] as const;
export type Priority = (typeof PRIORITIES)[number];
export const TEST_TYPES = ["unit", "integration", "e2e"] as const;
export type TestType = (typeof TEST_TYPES)[number];

export interface TestMetadata {
  id?: string;
  owner?: string;
  priority?: Priority;
  type?: TestType;
  tags: string[];
  fields: Record<string, string>;
  attachments?: Record<string, unknown>;
}
