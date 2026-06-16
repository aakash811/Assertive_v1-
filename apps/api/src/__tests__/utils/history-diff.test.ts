import { describe, expect, it } from "vitest";
import { generateMetadataDiff } from "../../utils/history-diff";

describe("generateMetadataDiff", () => {
  it("returns empty object when nothing changes", () => {
    const result = generateMetadataDiff(
      {
        title: "Login",
        owner: "alice",
        priority: "high",
        testType: "e2e",
        filePath: "auth.spec.ts",
        customFields: {
          area: "auth",
        },
      },

      {
        title: "Login",
        owner: "alice",
        priority: "high",
        testType: "e2e",
        filePath: "auth.spec.ts",
        customFields: {
          area: "auth",
        },
      },
    );

    expect(result).toEqual({});
  });

  it("detects title change", () => {
    const result = generateMetadataDiff({ title: "Old" }, { title: "New" });

    expect(result).toEqual({
      title: {
        from: "Old",
        to: "New",
      },
    });
  });

  it("detects owner change", () => {
    const result = generateMetadataDiff({ owner: "alice" }, { owner: "bob" });

    expect(result).toEqual({
      owner: {
        from: "alice",
        to: "bob",
      },
    });
  });

  it("detects multiple changes", () => {
    const result = generateMetadataDiff(
      {
        title: "Login",
        owner: "alice",
        priority: "low",
      },

      {
        title: "Checkout",
        owner: "bob",
        priority: "critical",
      },
    );

    expect(result).toEqual({
      title: {
        from: "Login",
        to: "Checkout",
      },

      owner: {
        from: "alice",
        to: "bob",
      },

      priority: {
        from: "low",
        to: "critical",
      },
    });
  });

  it("detects customFields change", () => {
    const result = generateMetadataDiff(
      {
        customFields: {
          area: "auth",
        },
      },

      {
        customFields: {
          area: "checkout",
        },
      },
    );

    expect(result).toEqual({
      customFields: {
        from: {
          area: "auth",
        },
        to: {
          area: "checkout",
        },
      },
    });
  });

  it("normalizes undefined to null", () => {
    const result = generateMetadataDiff({}, { owner: "alice" });

    expect(result).toEqual({
      owner: {
        from: null,
        to: "alice",
      },
    });
  });
});
