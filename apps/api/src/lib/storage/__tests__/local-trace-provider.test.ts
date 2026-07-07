import { describe, expect, it } from "vitest";

import { LocalTraceProvider } from "../local-trace-provider";

describe("local provider", () => {
  it("saves and reads trace", async () => {
    const provider = new LocalTraceProvider();

    const content = new TextEncoder().encode("hello");

    await provider.save("trace", content.buffer);

    const loaded = await provider.read("trace");

    expect(Buffer.from(loaded).toString()).toBe("hello");
  });
});
