import { describe, expect, it } from "vitest";
import { AssertiveClient } from "../client";

describe("AssertiveClient", () => {
  it("can be constructed", () => {
    const client = new AssertiveClient({
      apiKey: "key",
      apiUrl: "http://localhost",
      retries: 3,
      uploadTraces: false,
    });

    expect(client).toBeInstanceOf(AssertiveClient);
  });
});