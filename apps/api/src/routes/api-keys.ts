import { Hono } from "hono";
import { ok } from "../lib/api-response";
import { apiKeyService } from "../services/api-key.service";
import { apiKeyRepository } from "../repositories/api-key.repository";
import { prisma } from "../lib/prisma";
import { AppError } from "../lib/app-error";
import { ERROR_CODES } from "@assertive/shared";

export const apiKeyRoutes = new Hono();

apiKeyRoutes.post("/", async (c) => {
  const body = await c.req.json();

  const organization = await prisma.organization.findFirst();

  if (!organization) {
    throw new AppError(
      ERROR_CODES.PROJECT_NOT_FOUND,
      "Organization not found. Create one first.",
      404,
    );
  }

  const result = await apiKeyService.create(organization.id, body.name);

  return c.json(
    ok({
      id: result.apiKey.id,

      key: result.rawKey,
    }),
  );
});

apiKeyRoutes.get("/", async (c) => {
  const organization = await prisma.organization.findFirst();

  if (!organization) {
    return c.json(ok([]));
  }

  const keys = await apiKeyRepository.findMany(organization.id);

  return c.json(ok(keys));
});

apiKeyRoutes.delete("/:id", async (c) => {
  await apiKeyRepository.revoke(c.req.param("id"));

  return c.json(
    ok({
      success: true,
    }),
  );
});
