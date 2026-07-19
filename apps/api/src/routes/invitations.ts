import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ok } from "../lib/api-response";
import { invitationService } from "../services/invitation.service";
import { requireRole } from "../middleware/require-role";
import { apiKeyAuth } from "../middleware/api-key-auth";
import { authMiddleware } from "../middleware/auth";
import type { HonoVariables } from "../types/hono";
import { ORGANIZATION_ROLES } from "@assertive/shared";

const createInvitationSchema = z.object({
  email: z.string().email(),
  role: z.string().default("member"),
});

const acceptInvitationSchema = z.object({
  token: z.string().min(1),
});

export const invitationRoutes = new Hono<{
  Variables: HonoVariables;
}>();

invitationRoutes.use("*", apiKeyAuth);

invitationRoutes.post(
  "/",
  requireRole(ORGANIZATION_ROLES.ADMIN),
  zValidator("json", createInvitationSchema),
  async (c) => {
    const body = c.req.valid("json");
    const organizationId = c.get("organizationId");
    const apiKeyId = c.get("apiKeyId");

    const invitation = await invitationService.create({
      organizationId,
      email: body.email,
      role: body.role,
      invitedById: apiKeyId,
    });

    return c.json(ok(invitation), 201);
  },
);

invitationRoutes.get("/", async (c) => {
  const organizationId = c.get("organizationId");

  const invitations = await invitationService.listByOrganization(organizationId);

  return c.json(ok(invitations));
});

invitationRoutes.delete(
  "/:id",
  requireRole(ORGANIZATION_ROLES.ADMIN),
  async (c) => {
    const id = c.req.param("id");
    const organizationId = c.get("organizationId");

    await invitationService.revoke(id, organizationId);

    return c.json(ok({ success: true }));
  },
);

invitationRoutes.post(
  "/accept",
  authMiddleware,
  zValidator("json", acceptInvitationSchema),
  async (c) => {
    const body = c.req.valid("json");
    const userId = c.get("userId");

    const membership = await invitationService.accept({
      token: body.token,
      userId: userId!,
    });

    return c.json(ok(membership), 201);
  },
);
