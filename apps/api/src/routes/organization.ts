import { Hono } from "hono";
import { ok } from "../lib/api-response";
import type { HonoVariables } from "../types/hono";
import { organizationService } from "../services/organization.service";
import { AppError } from "../lib/app-error";
import { ERROR_CODES } from "@assertive/shared";
import { apiKeyAuth } from "../middleware/api-key-auth";
import { requireRole } from "../middleware/require-role";
import { ORGANIZATION_ROLES } from "@assertive/shared";

export const organizationRoutes = new Hono<{
  Variables: HonoVariables;
}>();

organizationRoutes.use("*", apiKeyAuth);

organizationRoutes.get("/", async (c) => {
  const organizationId = c.get("organizationId");

  const organization = await organizationService.getCurrent(organizationId);

  if (!organization) {
    throw new AppError(
      ERROR_CODES.ORGANIZATION_NOT_FOUND,
      "Organization not found",
      404,
    );
  }

  return c.json(ok(organization));
});

organizationRoutes.get(
  "/members",
  requireRole(ORGANIZATION_ROLES.MEMBER),
  async (c) => {
    const organizationId = c.get("organizationId");

    const members = await organizationService.getMembers(organizationId);

    return c.json(ok(members));
  },
);
