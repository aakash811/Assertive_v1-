import { describe, expect, it, vi } from "vitest";
import { AssertiveReporter } from "../reporter";

const createRunBatch = vi.fn();
const uploadBatch = vi.fn();
const requestTraceUploadUrl = vi.fn();
const uploadTrace = vi.fn();

vi.mock("../client", () => {
  class MockAssertiveClient {
    createRunBatch = createRunBatch;
    uploadBatch = uploadBatch;
    requestTraceUploadUrl = requestTraceUploadUrl;
    uploadTrace = uploadTrace;
  }

  return {
    AssertiveClient: MockAssertiveClient,
  };
});

vi.mock("../offline-queue", () => ({
  withQueueLock: vi.fn(async (fn) => await fn()),
  loadQueue: vi.fn(() => []),
  saveQueue: vi.fn(),
  enqueue: vi.fn(),
}));

import { beforeEach } from "vitest";

describe("AssertiveReporter", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    createRunBatch.mockResolvedValue({
      id: "batch-1",
    });

    uploadBatch.mockResolvedValue({});

    requestTraceUploadUrl.mockResolvedValue({
      uploadUrl: "upload-url",
      traceUrl: "trace-url",
      traceKey: "abc",
    });

    uploadTrace.mockResolvedValue({});
  });
  it("can be constructed", () => {
    expect(new AssertiveReporter()).toBeDefined();
  });

  it("starts a run batch", async () => {
    const reporter = new AssertiveReporter();

    await reporter.onBegin({} as never, {} as never);

    expect((reporter as any).runBatchId).toBe("batch-1");
  });
});
