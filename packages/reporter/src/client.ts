import type {
  BatchResult,
  RunBatchPayload,
  TestMetadata,
  TestRunPayload,
  TraceUploadResponse,
} from "./types";

import { ReporterConfig } from "./config";

type RunBatchResponse = {
  id: string;
};

type TestCaseResponse = {
  id: string;
  uniqueId: string;
};

type EmptyResponse = {
  success: true;
};

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

export class AssertiveClient {
  constructor(private config: ReporterConfig) {}

  private async request<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, init);

    const json = (await response.json()) as ApiResponse<T>;

    if (!response.ok) {
      throw new Error(json.success ? response.statusText : json.error.message);
    }

    if (!json.success) {
      throw new Error(json.error.message);
    }

    return json.data;
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.config.apiKey}`,

      "Content-Type": "application/json",
    };
  }

  async createRunBatch(payload: RunBatchPayload) {
    return this.request<RunBatchResponse>(
      `${this.config.apiUrl}/api/run-batches`,
      {
        method: "POST",

        headers: this.headers(),

        body: JSON.stringify(payload),
      },
    );
  }

  async createTestRun(payload: TestRunPayload) {
    return this.request<EmptyResponse>(`${this.config.apiUrl}/api/test-runs`, {
      method: "POST",

      headers: this.headers(),

      body: JSON.stringify(payload),
    });
  }

  async getTestCaseByUniqueId(uniqueId: string) {
    try {
      return await this.request<TestCaseResponse>(
        `${this.config.apiUrl}/api/test-cases/by-unique-id/${encodeURIComponent(uniqueId)}`,
        {
          headers: this.headers(),
        },
      );
    } catch {
      return null;
    }
  }

  async discoverTestCase(
    uniqueId: string,
    title: string,
    metadata?: TestMetadata,
  ) {
    return this.request<TestCaseResponse>(
      `${this.config.apiUrl}/api/test-cases/discover`,
      {
        method: "POST",

        headers: this.headers(),

        body: JSON.stringify({
          uniqueId,

          title,

          metadata,
        }),
      },
    );
  }

  async uploadBatch(runBatchId: string, results: BatchResult[]) {
    return this.request<EmptyResponse>(
      `${this.config.apiUrl}/api/run-batches/${runBatchId}/upload`,
      {
        method: "POST",

        headers: this.headers(),

        body: JSON.stringify({
          results,
        }),
      },
    );
  }

  async requestTraceUploadUrl() {
    return this.request<TraceUploadResponse>(
      `${this.config.apiUrl}/api/test-runs/upload-url`,
      {
        headers: this.headers(),
      },
    );
  }

  async uploadTrace(uploadUrl: string, trace: Buffer) {
    const response = await fetch(uploadUrl, {
      method: "PUT",

      body: new Uint8Array(trace),
    });

    if (!response.ok) {
      throw new Error(
        `Trace upload failed: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }
}
