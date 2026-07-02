import { Hono } from "hono";
import { ok } from "../lib/api-response";
import { tagService } from "../services/tag.service";
import { apiKeyAuth } from "../middleware/api-key-auth";
import type { HonoVariables } from "../types/hono";

export const tagRoutes = new Hono<{
  Variables: HonoVariables;
}>();

tagRoutes.use("*", apiKeyAuth);

tagRoutes.get("/", async (c) => {
  const projectId = c.get("projectId");

  return c.json(ok(await tagService.list(projectId)));
});

tagRoutes.post("/", async (c) => {
  const projectId = c.get("projectId");
  const body = await c.req.json();

  const tag = await tagService.create({
    projectId,
    name: body.name,
    color: body.color,
  });

  return c.json(ok(tag), 201);
});

tagRoutes.post("/:tagId/test-cases/:testCaseId", async (c) => {
  return c.json(
    ok(
      await tagService.assign(c.req.param("testCaseId"), c.req.param("tagId")),
    ),
  );
});

tagRoutes.delete("/:tagId/test-cases/:testCaseId", async (c) => {
  await tagService.remove(c.req.param("testCaseId"), c.req.param("tagId"));

  return c.json(ok({ success: true }));
});

tagRoutes.delete("/:id", async (c) => {
  await tagService.delete(c.req.param("id"));

  return c.json(
    ok({
      success: true,
    }),
  );
});
