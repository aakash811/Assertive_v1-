import { describe, expect, it } from "vitest";

import * as prismaExports from "../index";

describe("Database exports", () => {
  it("exports Prisma namespace", () => {
    expect(prismaExports).toBeDefined();
  });
});
