import { Hono } from "hono";
import { ok } from "../lib/api-response";
import { projectService } from "../services/project.service";
import { AppError } from "../lib/app-error";
import { ERROR_CODES } from "@assertive/shared";

import { apiKeyAuth } from "../middleware/api-key-auth";
import type { HonoVariables } from "../types/hono";

export const projectsRoutes = new Hono<{
  Variables: HonoVariables;
}>();

projectsRoutes.use("*", apiKeyAuth);

projectsRoutes.get("/", async (c) => {
  const organizationId = c.get("organizationId");
  const projects = await projectService.getAll(organizationId);

  return c.json(ok(projects));
});

projectsRoutes.post("/", async (c) => {
  const body = await c.req.json();

  const project = await projectService.create({
    name: body.name,
    slug: body.slug,
    organizationId: body.organizationId,
  });

  return c.json(ok(project), 201);
});

projectsRoutes.get("/:id", async (c) => {
  const id = c.req.param("id");
  const project = await projectService.getById(id);

  if (!project) {
    throw new AppError(ERROR_CODES.PROJECT_NOT_FOUND, "Project not found", 404);
  }

  return c.json(ok(project));
});

projectsRoutes.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const project = await projectService.update(id, body.name);

  return c.json(ok(project));
});

projectsRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await projectService.remove(id);

  return c.json(
    ok({
      success: true,
    }),
  );
});
