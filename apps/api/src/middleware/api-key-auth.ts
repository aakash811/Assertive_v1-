import { createMiddleware } from "hono/factory";
import { prisma } from "../lib/prisma";
import { hashAPIKey } from "../lib/hash";
import type { HonoVariables } from "../types/hono";

export const apiKeyAuth = createMiddleware<{
  Variables: HonoVariables;
}>(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return c.json(
      {
        error: "Missing API key",
      },
      401,
    );
  }

  const rawKey = authHeader.replace("Bearer ", "");
  const hashedKey = hashAPIKey(rawKey);

  const apiKey = await prisma.apiKey.findUnique({
    where: {
      hashedKey,
    },
  });

  if (!apiKey) {
    return c.json(
      {
        error: "Invalid API key",
      },
      401,
    );
  }

  if (!apiKey.isActive) {
    return c.json(
      {
        error: "API key revoked",
      },
      401,
    );
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return c.json(
      {
        error: "API key expired",
      },
      401,
    );
  }

  c.set("projectId", apiKey.projectId);
  c.set("apiKeyId", apiKey.id);

  await next();
});
