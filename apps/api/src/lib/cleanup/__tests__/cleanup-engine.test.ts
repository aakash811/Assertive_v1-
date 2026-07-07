import { describe, expect, it, vi } from "vitest";

import { CleanupEngine } from "../cleanup-engine";

describe("CleanupEngine", () => {
  it("runs enabled policies", async () => {
    const first = vi.fn().mockResolvedValue(5);
    const second = vi.fn().mockResolvedValue(3);

    const engine = new CleanupEngine([
      {
        name: "runs",
        enabled: true,
        execute: first,
      },
      {
        name: "history",
        enabled: true,
        execute: second,
      },
    ]);

    expect(await engine.run()).toEqual({
      runs: 5,
      history: 3,
    });

    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
  });

  it("skips disabled policies", async () => {
    const fn = vi.fn();

    const engine = new CleanupEngine([
      {
        name: "runs",
        enabled: false,
        execute: fn,
      },
    ]);

    expect(await engine.run()).toEqual({});

    expect(fn).not.toHaveBeenCalled();
  });
});
