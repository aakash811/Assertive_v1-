import { describe, expect, it } from "vitest";

import {
  createSignedToken,
  verifySignedToken,
} from "../../../lib/storage/trace-signing";

describe("trace signing", () => {
  it("accepts valid token", () => {
    const token = createSignedToken("abc");

    expect(verifySignedToken("abc", token.expires, token.signature)).toBe(true);
  });

  it("rejects invalid signature", () => {
    const token = createSignedToken("abc");

    expect(verifySignedToken("abc", token.expires, "invalid")).toBe(false);
  });

  it("rejects expired token", () => {
    const token = createSignedToken("abc", -5);

    expect(verifySignedToken("abc", token.expires, token.signature)).toBe(
      false,
    );
  });
});
