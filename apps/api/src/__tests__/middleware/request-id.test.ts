import { describe, expect, it } from "vitest";
import { Hono } from "hono";

import { requestIdMiddleware } from "../../middleware/request-id";
import type { HonoVariables } from "../../types/hono";

describe("requestIdMiddleware", () => {
  it("generates a request id and exposes it in the response header", async () => {
    const app = new Hono<{
      Variables: HonoVariables;
    }>();

    app.use("*", requestIdMiddleware);

    app.get("/", (c) => {
      return c.json({
        requestId: c.get("requestId"),
      });
    });

    const res = await app.request("/");

    expect(res.status).toBe(200);

    const body = await res.json();

    expect(typeof body.requestId).toBe("string");
    expect(body.requestId.length).toBeGreaterThan(0);

    expect(res.headers.get("x-request-id")).toBe(body.requestId);
  });
});
