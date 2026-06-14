import { Hono } from "hono";
import { prisma } from "../lib/prisma";
import { apiKeyAuth } from "../middleware/api-key-auth";
import type { HonoVariables } from "../types/hono";

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

  return c.json(project);
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

  return c.json(project);
});
