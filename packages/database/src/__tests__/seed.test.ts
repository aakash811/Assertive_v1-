import { describe, expect, it } from "vitest";
import { seedDatabase } from "../seed";

describe("Seed database", () => {
  it("exports seedDatabase", () => {
    expect(seedDatabase).toBeDefined();

    expect(typeof seedDatabase).toBe("function");
  });
});
