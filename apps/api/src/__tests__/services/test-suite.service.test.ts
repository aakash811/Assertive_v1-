import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../repositories/test-suite.repository", () => ({
  testSuiteRepository: {
    create: vi.fn(),

    findMany: vi.fn(),

    assignTestCase: vi.fn(),
  },
}));

import { testSuiteRepository } from "../../repositories/test-suite.repository";

import { testSuiteService } from "../../services/test-suite.service";

describe("testSuiteService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists suites", async () => {
    await testSuiteService.list("project-1");

    expect(testSuiteRepository.findMany).toHaveBeenCalledWith("project-1");
  });

  it("assigns test case", async () => {
    await testSuiteService.assignTestCase(
      "project-1",
      "suite-1",

      "tc-1",
    );

    expect(testSuiteRepository.assignTestCase).toHaveBeenCalledWith(
      "project-1",
      "suite-1",
      "tc-1",
    );
  });
});
