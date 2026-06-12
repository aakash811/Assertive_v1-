import type { RunBatchPayload, TestRunPayload } from "./types";
import { ReporterConfig } from "./config";

export class AssertiveClient {
  constructor(private config: ReporterConfig) {}

  private headers() {
    return {
      Authorization: `Bearer ${this.config.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  async createRunBatch(payload: RunBatchPayload) {
    const response = await fetch(`${this.config.apiUrl}/api/run-batches`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  async createTestRun(payload: TestRunPayload) {
    const response = await fetch(`${this.config.apiUrl}/api/test-runs`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  async getTestCaseByUniqueId(uniqueId: string) {
    const response = await fetch(
      `${this.config.apiUrl}/api/test-cases/by-unique-id/${encodeURIComponent(uniqueId)}`,
      {
        headers: this.headers(),
      },
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  }

  async discoverTestCase(uniqueId: string, title: string, metadata?: any) {
    const response = await fetch(
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

    return response.json();
  }

  async uploadBatch(runBatchId: string, results: any[]) {
    const response = await fetch(
      `${this.config.apiUrl}/api/run-batches/${runBatchId}/upload`,
      {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({ results }),
      },
    );
    return response.json();
  }
}
