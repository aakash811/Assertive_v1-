import { AssertiveClient } from "./client";
import { resolveConfig, type ReporterConfig } from "./config";
import { enqueue, loadQueue, saveQueue } from "./offline-queue";

import {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";

import { metadataStore } from "@assertive/helper";

interface BatchResult {
  uniqueId: string;
  status: string;
  durationMs: number;
  errorMessage?: string;
  traceUrl?: string | null;
}

export class AssertiveReporter implements Reporter {
  private client: AssertiveClient;
  private config: ReporterConfig;
  private runBatchId: string | null = null;
  private results: BatchResult[] = [];
  private offlineMode = false;

  constructor(config: Partial<ReporterConfig> = {}) {
    this.config = resolveConfig(config);
    this.client = new AssertiveClient(this.config);
  }

  async onBegin(_config: FullConfig, _suite: Suite) {
    const queue = loadQueue();
    const remaining = [];

    for (const item of queue) {
      try {
        const batch = await this.client.createRunBatch(item.batch);

        await this.client.uploadBatch(batch.id, item.results);
      } catch {
        remaining.push(item);
      }
    }

    saveQueue(remaining);

    if (queue.length > remaining.length) {
      console.log(
        `[Assertive] Flushed ${queue.length - remaining.length} queued uploads`,
      );
    }

    try {
      const batch = await this.client.createRunBatch({
        branch: process.env.GITHUB_REF_NAME ?? "local",

        environment: process.env.NODE_ENV ?? "development",
      });

      this.runBatchId = batch.id;

      console.log(`[Assertive] Run Batch: ${batch.id}`);
    } catch {
      this.offlineMode = true;

      this.runBatchId = `offline-${Date.now()}`;

      console.warn("[Assertive] API unavailable. Running in offline mode.");
    }
  }

  async onTestEnd(test: TestCase, result: TestResult) {
    if (!this.runBatchId) {
      return;
    }

    const metadata = metadataStore.get(test.title);

    const traceAttachment = result.attachments.find((attachment) =>
      attachment.path?.endsWith("trace.zip"),
    );

    const runResult: BatchResult = {
      uniqueId: test.title,

      status: result.status.toUpperCase(),

      durationMs: result.duration,

      errorMessage: result.error?.message,

      traceUrl: traceAttachment?.path ?? null,
    };

    if (this.offlineMode) {
      this.results.push(runResult);
      return;
    }

    let testCase = await this.client.getTestCaseByUniqueId(test.title);

    if (!testCase) {
      testCase = await this.client.discoverTestCase(
        test.title,
        test.title,
        metadata,
      );

      console.warn(`[Assertive] Discovered TestCase: ${test.title}`);

      return;
    }

    this.results.push(runResult);

    console.log(`[Assertive] Uploaded ${test.title}`);
  }

  async onEnd() {
    if (!this.runBatchId) {
      return;
    }

    if (this.offlineMode) {
      enqueue({
        batch: {
          branch: process.env.GITHUB_REF_NAME ?? "local",
          environment: process.env.NODE_ENV ?? "development",
        },

        results: this.results,
      });

      console.log("[Assertive] Stored offline queue");

      return;
    }

    try {
      await this.client.uploadBatch(this.runBatchId, this.results);

      console.log(`[Assertive] Uploaded ${this.results.length} results`);
    } catch {
      enqueue({
        batch: {
          branch: process.env.GITHUB_REF_NAME ?? "local",
          environment: process.env.NODE_ENV ?? "development",
        },
        results: this.results,
      });

      console.log("[Assertive] Stored offline queue");
    }
  }
}
