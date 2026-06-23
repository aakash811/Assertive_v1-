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
    include: {
      organization: {
        include: {
          projects: true,
        },
      },
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
  let project;

  if (override) {
    project = apiKey.organization.projects.find((p) => p.id === override);
  } else {
    project = apiKey.organization.projects[0];
  }

  if (!project) {
    throw new AppError(ERROR_CODES.PROJECT_NOT_FOUND, "Project not found", 404);
  }

  c.set("projectId", project.id);
  c.set("apiKeyId", apiKey.id);
  c.set("organizationId", apiKey.organizationId);

  await next();
});
