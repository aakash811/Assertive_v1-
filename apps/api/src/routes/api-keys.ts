import { Hono } from "hono";
import { apiKeyService } from "../services/api-key.service";
import { apiKeyRepository } from "../repositories/api-key.repository";
import { prisma } from "@assertive/database";

export const apiKeyRoutes = new Hono();

// Create a new API key
apiKeyRoutes.post("/", async (c) => {
  const body = await c.req.json();

  const project = await prisma.project.findFirst();

  if (!project) {
    return c.json(
      {
        error: "No Project found",
      },
      400,
    );
  }

  const result = await apiKeyService.create(project.id, body.name);

  return c.json({
    id: result.apiKey.id,
    key: result.rawKey,
  });
});

// Get all API keys for a project
apiKeyRoutes.get("/", async (c) => {
  const project = await prisma.project.findFirst();

  if (!project) {
    return c.json([]);
  }

  const keys = await apiKeyRepository.findMany(project.id);

  return c.json(keys);
});

//Delete an API key
apiKeyRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");

  await apiKeyRepository.revoke(id);

  return c.json({
    success: true,
  });
});
