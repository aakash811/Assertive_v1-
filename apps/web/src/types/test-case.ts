export type TestCase = {
  id: string;
  uniqueId: string;
  title: string;
  description: string | null;
  filePath: string | null;
  owner: string | null;
  priority: string | null;
  testType: string | null;
  customFields: Record<string, unknown> | null;
  lastStatus: string;
  isFlaky: boolean;
  flakyScore: number;
  syncState: string;
  isManualOverride: boolean;
  projectId: string;
  suiteId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Tag = {
  id: string;
  name: string;
  color?: string;
};

export type TestRun = {
  id: string;
  status: "PASSED" | "FAILED" | "SKIPPED" | "UNKNOWN";
  durationMs?: number | null;
  errorMessage?: string | null;
  traceUrl?: string | null;
  testCaseId: string;
  runBatchId: string;
  createdAt: string;
};

export type MetadataTestCase = {
  id: string;
  uniqueId: string;
  title: string;

  owner?: string | null;
  priority?: string | null;
  testType?: string | null;

  syncState: string;

  lastStatus: string;

  isFlaky: boolean;

  createdAt: string;
  updatedAt: string;
};

export type HistoryItem = {
  id: string;
  action: string;
  changes?: {
    status?: string;
    from?: string;
    to?: string;
  };
  comment?: string | null;
  changedBy?: string | null;
  createdAt: string;
};
