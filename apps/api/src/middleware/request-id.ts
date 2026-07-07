import { randomUUID } from "node:crypto";
import { createMiddleware } from "hono/factory";
import type { HonoVariables } from "../types/hono";

export const requestIdMiddleware = createMiddleware<{
  Variables: HonoVariables;
}>(async (c, next) => {
  const requestId = randomUUID();

  c.set("requestId", requestId);

  await next();

  c.header("x-request-id", requestId);
});
