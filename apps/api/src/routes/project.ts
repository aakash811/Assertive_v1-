import { Hono } from "hono";
import { ok } from "../lib/api-response";
import { prisma } from "../lib/prisma";
import { apiKeyAuth } from "../middleware/api-key-auth";
import type { HonoVariables } from "../types/hono";
import { AppError } from "../lib/app-error";
import { ERROR_CODES } from "@assertive/shared";

export const projectRoutes = new Hono<{
  Variables: HonoVariables;
}>();

projectRoutes.use("*", apiKeyAuth);

projectRoutes.get("/", async (c) => {
  const projectId = c.get("projectId");

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new AppError(ERROR_CODES.PROJECT_NOT_FOUND, "Project not found", 404);
  }

  return c.json(ok(project));
});

projectRoutes.patch("/", async (c) => {
  const projectId = c.get("projectId");
  const body = await c.req.json();

  const project = await prisma.project.update({
    where: {
      id: projectId,
    },

    data: {
      name: body.name,
    },
  });

  return c.json(ok(project));
});
