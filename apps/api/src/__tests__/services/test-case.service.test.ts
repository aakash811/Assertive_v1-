import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../repositories/test-case.repository", () => ({
  testCaseRepository: {
    create: vi.fn(),

    findMany: vi.fn(),

    findById: vi.fn(),

    update: vi.fn(),

    archive: vi.fn(),

    restore: vi.fn(),

    findByExternalId: vi.fn(),
  },
}));

vi.mock("../../services/history.service", () => ({
  historyService: {
    archived: vi.fn(),
    restored: vi.fn(),
  },
}));

import { testCaseRepository } from "../../repositories/test-case.repository";
import { historyService } from "../../services/history.service";
import { testCaseService } from "../../services/test-case.service";

describe("testCaseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates test case", async () => {
    await testCaseService.create("project-1", {
      externalId: "auth.login",

      title: "Login test",
    });

    expect(testCaseRepository.create).toHaveBeenCalledWith({
      projectId: "project-1",

      externalId: "auth.login",

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
      false,
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

  it("archives test case", async () => {
    vi.mocked(testCaseRepository.archive).mockResolvedValue({
      id: "tc-1",
    } as never);

    await testCaseService.archive(
      "tc-1",
      "project-1",
    );

    expect(testCaseRepository.archive).toHaveBeenCalledWith(
      "tc-1",
      "project-1",
    );

    expect(historyService.archived).toHaveBeenCalledWith("tc-1");
  });

  it("restores test case", async () => {
    vi.mocked(testCaseRepository.restore).mockResolvedValue({
      id: "tc-1",
    } as never);

    await testCaseService.restore(
      "tc-1",
      "project-1",
    );

    expect(testCaseRepository.restore).toHaveBeenCalledWith(
      "tc-1",
      "project-1",
    );

    expect(historyService.restored).toHaveBeenCalledWith("tc-1");
  });

  it("finds by external id", async () => {
    await testCaseService.findByExternalId(
      "auth.login",

      "project-1",
    );

    expect(testCaseRepository.findByExternalId).toHaveBeenCalledWith(
      "auth.login",
      "project-1",
      false,
    );
  });
});
