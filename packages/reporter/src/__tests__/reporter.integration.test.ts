import { beforeEach, describe, expect, it, vi } from "vitest";

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

vi.mock("node:fs", () => ({
  default: {
    readFileSync: vi.fn(() => Buffer.from("trace")),
  },
}));

describe("AssertiveReporter integration", () => {
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

  it("uploads collected results", async () => {
    const reporter = new AssertiveReporter();

    await reporter.onBegin({} as never, {} as never);

    await reporter.onTestEnd(
      {
        title: "login",
        parent: {
          project: () => ({
            name: "chromium",
          }),
        },
      } as never,
      {
        status: "passed",
        duration: 100,
        retry: 0,
        attachments: [],
      } as never,
    );

    await reporter.onEnd();

    expect(uploadBatch).toHaveBeenCalledTimes(1);
  });

  it("uploads traces when enabled", async () => {
    const reporter = new AssertiveReporter({
      uploadTraces: true,
    });

    await reporter.onBegin({} as never, {} as never);

    await reporter.onTestEnd(
      {
        title: "login",
        parent: {
          project: () => ({
            name: "chromium",
          }),
        },
      } as never,
      {
        status: "passed",
        duration: 100,
        retry: 0,
        attachments: [
          {
            path: "trace.zip",
          },
        ],
      } as never,
    );

    expect(requestTraceUploadUrl).toHaveBeenCalled();
    expect(uploadTrace).toHaveBeenCalled();
  });

  it("falls back to offline mode when batch creation fails", async () => {
    createRunBatch.mockRejectedValue(new Error("offline"));

    const reporter = new AssertiveReporter();

    await reporter.onBegin({} as never, {} as never);

    expect((reporter as any).offlineMode).toBe(true);
  });
});
