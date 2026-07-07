import { Hono } from "hono";
import { ok } from "../lib/api-response";
import { apiKeyService } from "../services/api-key.service";
import { apiKeyRepository } from "../repositories/api-key.repository";
import { AppError } from "../lib/app-error";
import { API_SCOPES, ERROR_CODES, type ApiScope } from "@assertive/shared";
import { requireScope } from "../middleware/require-scope";
import { apiKeyAuth } from "../middleware/api-key-auth";

export const apiKeyRoutes = new Hono();

apiKeyRoutes.use("*", apiKeyAuth);

apiKeyRoutes.post("/", requireScope(API_SCOPES.API_KEYS_WRITE), async (c) => {
  const body = await c.req.json();

  const organizationId = c.get("organizationId");

  if (!organizationId) {
    throw new AppError(
      ERROR_CODES.ORGANIZATION_NOT_FOUND,
      "Organization not found.",
      404,
    );
  }

  const result = await apiKeyService.create(
    organizationId,
    body.name,
    body.scopes as ApiScope[],
  );

  return c.json(
    ok({
      id: result.apiKey.id,
      key: result.rawKey,
    }),
  );
});

apiKeyRoutes.get("/", requireScope(API_SCOPES.API_KEYS_READ), async (c) => {
  const organizationId = c.get("organizationId");

  const keys = await apiKeyRepository.findMany(organizationId);

  return c.json(ok(keys));
});

apiKeyRoutes.delete(
  "/:id",
  requireScope(API_SCOPES.API_KEYS_WRITE),
  async (c) => {
    await apiKeyRepository.revoke(c.req.param("id"));

    return c.json(
      ok({
        success: true,
      }),
    );
  },
);
