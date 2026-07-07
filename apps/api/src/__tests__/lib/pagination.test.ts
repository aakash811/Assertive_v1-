import { describe, expect, it } from "vitest";
import { getPagination } from "../../lib/pagination";

describe("getPagination", () => {
  it("returns defaults", () => {
    expect(getPagination()).toEqual({
      page: 1,
      limit: 20,
    });
  });

  it("parses valid values", () => {
    expect(getPagination("2", "50")).toEqual({
      page: 2,
      limit: 50,
    });
  });

  it("rejects invalid values", () => {
    expect(getPagination("-1", "1000")).toEqual({
      page: 1,
      limit: 20,
    });
  });
});
