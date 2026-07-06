import os from "node:os";
import { AssertiveClient } from "./client";
import { BatchResult } from "./types";
import { resolveConfig, type ReporterConfig } from "./config";
import { enqueue, loadQueue, saveQueue, withQueueLock } from "./offline-queue";
import { getCIContext } from "./context";

import {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import fs from "node:fs";

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

  private async retry<T>(operation: () => Promise<T>): Promise<T> {
    let delay = 1000;
    let lastError: unknown;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === 3) {
          break;
        }

        console.warn(
          `[Assertive] Retry ${attempt}/3 failed. Retrying in ${delay}ms...`,
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }

    throw lastError;
  }

  async onBegin(_config: FullConfig, _suite: Suite) {
    await withQueueLock(async () => {
      const queue = loadQueue();

      if (queue.length) {
        console.log(
          `[Assertive] Replaying ${queue.length} queued upload(s)...`,
        );
      }

      const remaining = [];

      for (const item of queue) {
        try {
          const batch = await this.client.createRunBatch(item.batch);
          await this.client.uploadBatch(batch.id, item.results);
        } catch (error) {
          console.warn(
            `[Assertive] Failed to replay queued upload: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );

          remaining.push(item);
        }
      }

      saveQueue(remaining);

      if (queue.length > remaining.length) {
        console.log(
          `[Assertive] Flushed ${queue.length - remaining.length} queued uploads`,
        );
      }
    });

    try {
      const ciContext = getCIContext();
      const batch = await this.retry(() =>
        this.client.createRunBatch({
          branch: ciContext.branch,
          commitSha: ciContext.commitSha,
          ciBuildId: ciContext.ciBuildId,
          ciBuildUrl: ciContext.ciBuildUrl,
          environment: ciContext.environment,
          triggeredBy: ciContext.triggeredBy,
        }),
      );

      this.runBatchId = batch.id;

      console.log(`[Assertive] Run Batch: ${batch.id}`);
    } catch (error) {
      console.log(error);
      this.offlineMode = true;

      this.runBatchId = `offline-${Date.now()}`;

      console.warn("[Assertive] API unavailable. Running in offline mode.");
    }
  }

  async onTestEnd(test: TestCase, result: TestResult) {
    if (!this.runBatchId) {
      return;
    }

    const traceAttachment = result.attachments.find((attachment) =>
      attachment.path?.endsWith("trace.zip"),
    );

    const runResult: BatchResult = {
      externalId: test.title,
      status: result.status.toUpperCase(),
      durationMs: result.duration,
      errorMessage: result.error?.message,
      errorStack: result.error?.stack,
      traceUrl: traceAttachment?.path ?? null,
      browser: test.parent.project()?.name,
      os: os.platform(),
      retryOf: result.retry > 0 ? result.retry - 1 : undefined,
      attemptNumber: result.retry + 1,
    };

    if (this.config.uploadTraces && traceAttachment?.path) {
      try {
        const trace = await this.client.requestTraceUploadUrl();
        const traceContent = fs.readFileSync(traceAttachment.path);

        await this.client.uploadTrace(trace.uploadUrl, traceContent);

        runResult.traceUrl = trace.traceUrl;
      } catch (error) {
        console.warn(
          `[Assertive] Failed to upload trace for ${test.title}: ${error instanceof Error ? error.message : error}`,
        );
      }
    }

    if (this.offlineMode) {
      this.results.push(runResult);
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
      await withQueueLock(async () => {
        enqueue({
          batch: {
            branch: process.env.GITHUB_REF_NAME ?? "local",
            environment: process.env.NODE_ENV ?? "development",
          },
          results: this.results,
        });
      });

      console.log("[Assertive] Stored offline queue");

      return;
    }

    try {
      console.log(
        `[Assertive] Uploading ${this.results.length} test result(s)...`,
      );

      await this.retry(() =>
        this.client.uploadBatch(this.runBatchId!, this.results),
      );

      console.log("[Assertive] Upload completed successfully.");
    } catch (error) {
      console.error(
        `[Assertive] Upload failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      enqueue({
        batch: {
          branch: process.env.GITHUB_REF_NAME ?? "local",
          environment: process.env.NODE_ENV ?? "development",
        },
        results: this.results,
      });
      console.log(
        "[Assertive] Upload queued for retry in offline queue.",
      );
    }
  }
}
