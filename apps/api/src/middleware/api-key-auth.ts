import { createMiddleware } from "hono/factory";
import { prisma } from "../lib/prisma";
import { hashAPIKey } from "../lib/hash";
import type { HonoVariables } from "../types/hono";
import { AppError } from "../lib/app-error";
import { ERROR_CODES } from "@assertive/shared";

export const apiKeyAuth = createMiddleware<{
  Variables: HonoVariables;
}>(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Missing API key", 401);
  }

  const rawKey = authHeader.replace("Bearer ", "");
  const hashedKey = hashAPIKey(rawKey);

  const apiKey = await prisma.apiKey.findUnique({
    where: {
      hashedKey,
    },
  });

  if (!apiKey) {
    throw new AppError(ERROR_CODES.INVALID_API_KEY, "Invalid API key", 401);
  }
  if (!apiKey.isActive) {
    throw new AppError(ERROR_CODES.PERMISSION_DENIED, "API key revoked", 401);
  }
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    throw new AppError(ERROR_CODES.API_KEY_EXPIRED, "API key expired", 401);
  }

  const override = c.req.header("x-project-id");

  const project = override
    ? await prisma.project.findUnique({
        where: {
          id: override,
        },
      })
    : await prisma.project.findFirst({
        where: {
          organizationId: apiKey.organizationId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

  if (!project || project.organizationId !== apiKey.organizationId) {
    throw new AppError(ERROR_CODES.PROJECT_NOT_FOUND, "Project not found", 404);
  }

  c.set("projectId", project.id);
  c.set("apiKeyId", apiKey.id);
  c.set("organizationId", apiKey.organizationId);
  c.set("apiScopes", apiKey.scopes);
  c.set("organizationRole", "owner");

  await next();
});
