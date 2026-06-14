export type RunBatch = {
  id: string;
  branch?: string | null;
  commitSha?: string | null;
  environment?: string | null;
  totalCount: number;
  passedCount: number;
  failedCount: number;
  skippedCount: number;
  createdAt: string;
  triggeredBy?: string | null;
};

export type RunBatchResponse = {
  items: RunBatch[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
