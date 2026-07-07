import { beforeEach, describe, expect, it } from "vitest";

import { syncLockService } from "../../services/sync-lock.service";

describe("syncLockService", () => {
  beforeEach(() => {
    syncLockService.release("project-1");
    syncLockService.release("project-2");
  });

  it("acquires lock", () => {
    expect(syncLockService.acquire("project-1")).toBe(true);
  });

  it("rejects duplicate acquire", () => {
    expect(syncLockService.acquire("project-1")).toBe(true);

    expect(syncLockService.acquire("project-1")).toBe(false);
  });

  it("allows acquire after release", () => {
    syncLockService.acquire("project-1");

    syncLockService.release("project-1");

    expect(syncLockService.acquire("project-1")).toBe(true);
  });

  it("locks are isolated per project", () => {
    expect(syncLockService.acquire("project-1")).toBe(true);

    expect(syncLockService.acquire("project-2")).toBe(true);
  });
});
