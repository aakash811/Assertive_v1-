import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { logger } from "../../lib/logger";

describe("logger", () => {
  const spy = vi.spyOn(console, "log");

  beforeEach(() => {
    spy.mockClear();
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it("logs structured json", () => {
    logger.info("hello", {
      requestId: "123",
    });

    expect(spy).toHaveBeenCalledTimes(1);

    const payload = JSON.parse(spy.mock.calls[0][0]);

    expect(payload.level).toBe("info");
    expect(payload.message).toBe("hello");
    expect(payload.requestId).toBe("123");
  });
});
