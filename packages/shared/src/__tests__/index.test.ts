import { describe, expect, it } from "vitest";
import type { Project } from "../index";

describe("Project", () => {
  it("creates a valid project object", () => {
    const project: Project = {
      id: "project-1",
      name: "Assertive",
    };

    expect(project.id).toBe("project-1");
    expect(project.name).toBe("Assertive");
  });
});
