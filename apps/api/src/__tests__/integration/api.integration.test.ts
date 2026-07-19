import { describe, expect, it, vi } from "vitest";

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
  },
  organizationMember: {
    findFirst: vi.fn(),
  },
  project: {
    findFirst: vi.fn(),
  },
  apiKey: {
    findUnique: vi.fn(),
  },
};

vi.mock("../../lib/prisma", () => ({
  prisma: mockPrisma,
}));

describe("API integration", () => {
  it("health endpoint returns ok", async () => {
    const mod = await import("../../index.js");
    const app = mod.app as any;

    const res = await app.request("http://localhost/api/health");

    expect(res.status).toBe(200);
  });
});
