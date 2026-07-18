import { createMiddleware } from "hono/factory";
import { verifyJwt } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import type { HonoVariables } from "../types/hono";
import { AppError } from "../lib/app-error";
import { ERROR_CODES } from "@assertive/shared";

export const authMiddleware = createMiddleware<{
  Variables: HonoVariables;
}>(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Missing authentication token", 401);
  }

  const token = authHeader.replace("Bearer ", "");

  let payload;

  try {
    payload = verifyJwt(token);
  } catch {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Invalid or expired token", 401);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.sub,
    },
    include: {
      memberships: {
        include: {
          org: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "User not found", 401);
  }

  const membership = user.memberships[0];

  if (!membership) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "No organization membership", 401);
  }

  c.set("userId", user.id);
  c.set("organizationId", membership.orgId);
  c.set("projectId", membership.orgId);
  c.set("organizationRole", membership.role);
  c.set("apiScopes", []);
  c.set("apiKeyId", "");

  await next();
});
