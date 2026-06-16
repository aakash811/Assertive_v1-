import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../repositories/tag.repository", () => ({
  tagRepository: {
    create: vi.fn(),

    findMany: vi.fn(),

    assign: vi.fn(),

    remove: vi.fn(),
  },
}));

import { tagRepository } from "../../repositories/tag.repository";

import { tagService } from "../../services/tag.service";

describe("tagService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists tags", async () => {
    await tagService.list("project-1");

    expect(tagRepository.findMany).toHaveBeenCalledWith("project-1");
  });

  it("assigns tag", async () => {
    await tagService.assign("tc-1", "tag-1");

    expect(tagRepository.assign).toHaveBeenCalledWith(
      "tc-1",

      "tag-1",
    );
  });

  it("removes tag", async () => {
    await tagService.remove("tc-1", "tag-1");

    expect(tagRepository.remove).toHaveBeenCalledWith(
      "tc-1",

      "tag-1",
    );
  });
});
