import { audit } from "../lib/audit";

export const auditService = {
  apiKeyCreated(id: string, organizationId: string) {
    audit.log("api_key.created", {
      apiKeyId: id,
      organizationId,
    });
  },

  apiKeyRevoked(id: string) {
    audit.log("api_key.revoked", {
      apiKeyId: id,
    });
  },

  projectCreated(id: string, organizationId: string) {
    audit.log("project.created", {
      projectId: id,
      organizationId,
    });
  },

  projectUpdated(id: string) {
    audit.log("project.updated", {
      projectId: id,
    });
  },

  projectDeleted(id: string) {
    audit.log("project.deleted", {
      projectId: id,
    });
  },

  cleanup(result: unknown) {
    audit.log("cleanup.completed", {
      result,
    });
  },
};
