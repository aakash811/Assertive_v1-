import { createMiddleware } from "hono/factory";
import type { ApiScope } from "@assertive/shared";
import { AppError } from "../lib/app-error";
import { ERROR_CODES } from "@assertive/shared";
import type { HonoVariables } from "../types/hono";

export function requireScope(scope: ApiScope) {
  return createMiddleware<{
    Variables: HonoVariables;
  }>(async (c, next) => {
    const scopes = c.get("apiScopes");

    if (!scopes.includes(scope)) {
      throw new AppError(
        ERROR_CODES.PERMISSION_DENIED,
        "Missing required API scope",
        403,
      );
    }

    await next();
  });
}
