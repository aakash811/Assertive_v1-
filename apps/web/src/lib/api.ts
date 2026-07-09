import type {
  AnalyticsSummary,
  FailureItem,
  FlakyTest,
  RecentFailure,
  SlowTest,
  StatusDistibution,
} from "@/types/analytics";
import type { ApiKey, createdApiKey } from "@/types/api-key";
import type { RunBatch } from "@/types/run-batch";
import type { RunResult } from "@/types/run-result";
import type { HistoryItem, TestCase, TestRun } from "@/types/test-case";
import type { PaginatedData } from "@/types/api";
import { Project } from "@/types/project";
import type { Organization, Member } from "@/types/organization";

const API_BASE_PATH = "/api/assertive";

//
// URL Helpers
//

function apiUrl(path: string) {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL ??
        process.env.APP_URL ??
        "http://localhost:3000");

  return new URL(`${API_BASE_PATH}${path}`, origin).toString();
}

function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.ASSERTIVE_API_KEY ?? ""}`,
  };
}

//
// Transport Types
//

type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

type ApiResponse<T> = ApiSuccess<T> | ApiError;

type PaginatedApiSuccess<T> = {
  success: true;
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};

type PaginatedApiResponse<T> = PaginatedApiSuccess<T> | ApiError;

//
// Generic Request Helpers
//

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = { ...(init?.headers ?? {}) };
  const response = await fetch(apiUrl(path), { ...init, headers });
  const json = (await response.json()) as ApiResponse<T>;

  if (!response.ok) {
    throw new Error(json.success ? response.statusText : json.error.message);
  }

  if (!json.success) {
    throw new Error(json.error.message);
  }

  return json.data;
}

async function paginatedRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<PaginatedData<T>> {
  const headers = { ...(init?.headers ?? {}) };

  const response = await fetch(apiUrl(path), { ...init, headers });
  const json = (await response.json()) as PaginatedApiResponse<T>;

  if (!response.ok) {
    throw new Error(json.success ? response.statusText : json.error.message);
  }

  if (!json.success) {
    throw new Error(json.error.message);
  }

  return {
    items: json.items,
    pagination: json.pagination,
  };
}

//
// Metrics
//

export function getMetricsSummary(): Promise<AnalyticsSummary> {
  return request<AnalyticsSummary>("/metrics/summary", {
    headers: authHeaders(),
    cache: "no-store",
  });
}

//
// Test Cases
//

export function getTestCases(params?: {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  owner?: string;
  tag?: string;
  flaky?: boolean;
  syncState?: "SYNCED" | "STALE";
  suite?: string;
  type?: string;
  priority?: string;
}): Promise<PaginatedData<TestCase>> {
  const search = new URLSearchParams();

  if (params?.page) {
    search.set("page", String(params.page));
  }

  if (params?.limit) {
    search.set("limit", String(params.limit));
  }

  if (params?.q) {
    search.set("q", params.q);
  }

  if (params?.status) {
    search.set("status", params.status);
  }

  if (params?.owner) {
    search.set("owner", params.owner);
  }

  if (params?.tag) {
    search.set("tag", params.tag);
  }

  if (params?.flaky) {
    search.set("flaky", "true");
  }

  if (params?.syncState) {
    search.set("syncState", params.syncState);
  }

  if (params?.suite) {
    search.set("suite", params.suite);
  }

  if (params?.type) {
    search.set("type", params.type);
  }

  if (params?.priority) {
    search.set("priority", params.priority);
  }

  return paginatedRequest<TestCase>(`/test-cases?${search.toString()}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
}

export function getTestCase(id: string): Promise<TestCase> {
  return request<TestCase>(`/test-cases/${id}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
}

export function getTestCaseHistory(id: string): Promise<HistoryItem[]> {
  return request<HistoryItem[]>(`/test-cases/${id}/history`, {
    headers: authHeaders(),
    cache: "no-store",
  });
}

//
// Test Runs
//

export function getTestRuns(
  page = 1,
  limit = 20,
): Promise<PaginatedData<TestRun>> {
  return paginatedRequest<TestRun>(`/test-runs?page=${page}&limit=${limit}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
}

//
// Run Batches
//

export function getRunBatches(
  filters: {
    page?: number;
    limit?: number;
    q?: string;
    environment?: string;
    triggeredBy?: string;
  } = {},
): Promise<PaginatedData<RunBatch>> {
  const params = new URLSearchParams();

  params.set("page", String(filters.page ?? 1));

  params.set("limit", String(filters.limit ?? 20));

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.environment) {
    params.set("environment", filters.environment);
  }

  if (filters.triggeredBy) {
    params.set("triggeredBy", filters.triggeredBy);
  }

  return paginatedRequest<RunBatch>(
    `/run-batches?${params.toString()}`,

    {
      headers: authHeaders(),

      cache: "no-store",
    },
  );
}

export function getRunBatch(id: string): Promise<RunBatch> {
  return request<RunBatch>(`/run-batches/${id}`, {
    headers: authHeaders(),
    cache: "no-store",
  });
}

//
// Analytics
//

export function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  return request<AnalyticsSummary>("/analytics/summary", {
    headers: authHeaders(),
    cache: "no-store",
  });
}

export function getMostFailingTests(): Promise<FailureItem[]> {
  return request<FailureItem[]>("/analytics/failures", {
    headers: authHeaders(),
    cache: "no-store",
  });
}

export function getSlowestTests(): Promise<SlowTest[]> {
  return request<SlowTest[]>("/analytics/slowest", {
    headers: authHeaders(),
    cache: "no-store",
  });
}

export function getFlakyTests(): Promise<FlakyTest[]> {
  return request<FlakyTest[]>("/analytics/flaky", {
    headers: authHeaders(),
    cache: "no-store",
  });
}

export function getStatusDistribution(): Promise<StatusDistibution[]> {
  return request<StatusDistibution[]>("/analytics/status-distribution", {
    headers: authHeaders(),
    cache: "no-store",
  });
}

export function getRecentFailures(): Promise<RecentFailure[]> {
  return request<RecentFailure[]>("/analytics/recent-failures", {
    headers: authHeaders(),

    cache: "no-store",
  });
}

//
// Manual Override
//

export function overrideTestCaseStatus(
  id: string,
  status: "PASSED" | "FAILED" | "SKIPPED",
  comment: string,
): Promise<void> {
  return request<void>(`/test-cases/${id}/override`, {
    method: "PATCH",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status,
      comment,
    }),
  });
}

//
// Projects
//
export function getProjects() {
  return request<Project[]>("/projects", {
    headers: authHeaders(),
    cache: "no-store",
  });
}

export function createProject(
  name: string,
  slug: string,
  organizationId: string,
) {
  return request<Project>("/projects", {
    method: "POST",

    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      name,
      slug,
      organizationId,
    }),
  });
}

//
// Project
//

export function getProject(): Promise<Project> {
  return request<Project>("/project", {
    headers: authHeaders(),
    cache: "no-store",
  });
}

export function updateProject(name: string): Promise<Project> {
  return request<Project>("/project", {
    method: "PATCH",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      name,
    }),
  });
}

//
// API Keys
//

export function getApiKeys(): Promise<ApiKey[]> {
  return request<ApiKey[]>("/api-keys", {
    headers: authHeaders(),
    cache: "no-store",
  });
}

export function createApiKey(name: string): Promise<createdApiKey> {
  return request<createdApiKey>("/api-keys", {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      name,
    }),
  });
}

export function revokeApiKey(id: string): Promise<void> {
  return request<void>(`/api-keys/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

//
// Organization
//

export function getOrganization(): Promise<Organization> {
  return request<Organization>(
    "/organization",

    {
      headers: authHeaders(),

      cache: "no-store",
    },
  );
}

export function getOrganizationMembers(): Promise<Member[]> {
  return request<Member[]>(
    "/organization/members",

    {
      headers: authHeaders(),

      cache: "no-store",
    },
  );
}
