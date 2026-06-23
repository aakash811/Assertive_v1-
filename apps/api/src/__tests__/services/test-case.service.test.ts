import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../repositories/test-case.repository", () => ({
  testCaseRepository: {
    create: vi.fn(),

    findMany: vi.fn(),

    findById: vi.fn(),

    update: vi.fn(),

    delete: vi.fn(),

    findByUniqueId: vi.fn(),
  },
}));

import { testCaseRepository } from "../../repositories/test-case.repository";

import { testCaseService } from "../../services/test-case.service";

describe("testCaseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates test case", async () => {
    await testCaseService.create("project-1", {
      uniqueId: "auth.login",

      title: "Login test",
    });

    expect(testCaseRepository.create).toHaveBeenCalledWith({
      projectId: "project-1",

      uniqueId: "auth.login",

      title: "Login test",
    });
  });

  it("lists test cases", async () => {
    await testCaseService.list("project-1", {
      page: 1,
      limit: 20,
    });

    expect(testCaseRepository.findMany).toHaveBeenCalledWith("project-1", {
      page: 1,
      limit: 20,
    });
  });

  it("gets test case", async () => {
    await testCaseService.get("tc-1", "project-1");

    expect(testCaseRepository.findById).toHaveBeenCalledWith(
      "tc-1",
      "project-1",
    );
  });

  it("updates test case", async () => {
    await testCaseService.update(
      "tc-1",

      { title: "Updated" },

      "project-1",
    );

    expect(testCaseRepository.update).toHaveBeenCalledWith(
      "tc-1",

      { title: "Updated" },

      "project-1",
    );
  });

  it("deletes test case", async () => {
    await testCaseService.delete(
      "tc-1",

      "project-1",
    );

    expect(testCaseRepository.delete).toHaveBeenCalledWith(
      "tc-1",

      "project-1",
    );
  });

  it("finds by unique id", async () => {
    await testCaseService.findByUniqueId(
      "auth.login",

      "project-1",
    );

    expect(testCaseRepository.findByUniqueId).toHaveBeenCalledWith(
      "auth.login",

      "project-1",
    );
  });
});
