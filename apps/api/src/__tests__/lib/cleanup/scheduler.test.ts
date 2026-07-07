import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { CleanupScheduler } from "../../../lib/cleanup/scheduler";

describe("CleanupScheduler", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("runs scheduled jobs", async () => {
    const job = vi.fn().mockResolvedValue(undefined);

    const scheduler = new CleanupScheduler(job, 1000);

    scheduler.start();

    await vi.advanceTimersByTimeAsync(1000);

    expect(job).toHaveBeenCalledTimes(1);

    scheduler.stop();
  });

  it("stops scheduled jobs", async () => {
    const job = vi.fn().mockResolvedValue(undefined);

    const scheduler = new CleanupScheduler(job, 1000);

    scheduler.start();
    scheduler.stop();

    await vi.advanceTimersByTimeAsync(5000);

    expect(job).not.toHaveBeenCalled();
  });
});
