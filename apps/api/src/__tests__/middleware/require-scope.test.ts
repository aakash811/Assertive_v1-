import { describe, expect, it } from "vitest";
import { Hono } from "hono";

import type { HonoVariables } from "../../types/hono";
import { requireScope } from "../../middleware/require-scope";
import { AppError } from "../../lib/app-error";
import { fail } from "../../lib/api-response";
import { API_SCOPES, ERROR_CODES } from "@assertive/shared";

describe("requireScope", () => {
  function createApp() {
    const app = new Hono<{
      Variables: HonoVariables;
    }>();

    app.onError((error, c) => {
      if (error instanceof AppError) {
        return c.json(
          fail(error.code, error.message, error.details),
          error.status as 400 | 401 | 403 | 404 | 500,
        );
      }

      return c.json(
        fail(ERROR_CODES.INTERNAL_SERVER_ERROR, "Internal server error"),
        500,
      );
    });

    return app;
  }

  it("allows request when scope exists", async () => {
    const app = createApp();

    app.use("*", async (c, next) => {
      c.set("apiScopes", [API_SCOPES.API_KEYS_READ]);
      await next();
    });

    app.use("*", requireScope(API_SCOPES.API_KEYS_READ));

    app.get("/", (c) => c.json({ ok: true }));

    const res = await app.request("/");

    expect(res.status).toBe(200);
  });

  it("rejects missing scope", async () => {
    const app = createApp();

    app.use("*", async (c, next) => {
      c.set("apiScopes", []);
      await next();
    });

    app.use("*", requireScope(API_SCOPES.API_KEYS_WRITE));

    app.get("/", (c) => c.json({ ok: true }));

    const res = await app.request("/");

    expect(res.status).toBe(403);

    const body = await res.json();

    expect(body.success).toBe(false);
    expect(body.error.code).toBe(ERROR_CODES.PERMISSION_DENIED);
  });
});
