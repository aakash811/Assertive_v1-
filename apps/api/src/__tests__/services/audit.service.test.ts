import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/audit", () => ({
  audit: {
    log: vi.fn(),
  },
}));

import { audit } from "../../lib/audit";
import { auditService } from "../../services/audit.service";

describe("auditService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs api key creation", () => {
    auditService.apiKeyCreated("key-1", "org-1");

    expect(audit.log).toHaveBeenCalledWith("api_key.created", {
      apiKeyId: "key-1",
      organizationId: "org-1",
    });
  });

  it("logs api key revocation", () => {
    auditService.apiKeyRevoked("key-1");

    expect(audit.log).toHaveBeenCalledWith("api_key.revoked", {
      apiKeyId: "key-1",
    });
  });

  it("logs project creation", () => {
    auditService.projectCreated("project-1", "org-1");

    expect(audit.log).toHaveBeenCalledWith("project.created", {
      projectId: "project-1",
      organizationId: "org-1",
    });
  });

  it("logs project update", () => {
    auditService.projectUpdated("project-1");

    expect(audit.log).toHaveBeenCalledWith("project.updated", {
      projectId: "project-1",
    });
  });

  it("logs project deletion", () => {
    auditService.projectDeleted("project-1");

    expect(audit.log).toHaveBeenCalledWith("project.deleted", {
      projectId: "project-1",
    });
  });

  it("logs cleanup completion", () => {
    const result = {
      runs: 10,
      history: 5,
      traces: 2,
    };

    auditService.cleanup(result);

    expect(audit.log).toHaveBeenCalledWith("cleanup.completed", {
      result,
    });
  });
});
