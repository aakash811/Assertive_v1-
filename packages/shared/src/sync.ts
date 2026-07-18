export interface SyncTestCase {
  externalId: string;
  title: string;
  filePath: string;
  owner?: string;
  priority?: string;
  testType?: string;
  suite?: string;
  tags: string[];
  customFields: Record<string, string>;
}

export interface SyncPayload {
  testCases: SyncTestCase[];
}

export interface SyncResponse {
  synced: number;
  created: number;
  updated: number;
  restored: number;
  stale: number;
}
