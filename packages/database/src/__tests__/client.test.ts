import { describe, expect, it } from "vitest";

import { prisma } from "../client";

describe("Prisma client", () => {
  it("should exist", () => {
    expect(prisma).toBeDefined();
  });

  it("should have connect function", () => {
    expect(prisma.$connect).toBeDefined();
  });

  it("should have disconnect function", () => {
    expect(prisma.$disconnect).toBeDefined();
  });
});
