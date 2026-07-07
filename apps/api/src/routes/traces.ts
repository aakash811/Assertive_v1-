import { Hono } from "hono";
import { apiKeyAuth } from "../middleware/api-key-auth";
import { randomUUID } from "node:crypto";
import {
  readTrace,
  saveTrace,
  getTraceUrl,
} from "../lib/storage/trace-storage";
import { ok, fail } from "../lib/api-response";
import { ERROR_CODES } from "@assertive/shared";
import { verifySignedToken } from "../lib/storage/trace-signing";

export const traceRoutes = new Hono();

traceRoutes.use("/test-runs/upload-url", apiKeyAuth);

traceRoutes.get("/test-runs/upload-url", async (c) => {
  const traceKey = randomUUID();

  return c.json(
    ok({
      traceKey,
      uploadUrl: `${new URL(c.req.url).origin}/api/traces/${traceKey}`,
      traceUrl: getTraceUrl(traceKey),
    }),
  );
});

traceRoutes.put("/traces/:traceKey", async (c) => {
  const traceKey = c.req.param("traceKey");
  const body = await c.req.arrayBuffer();

  await saveTrace(traceKey, body);

  return c.json(
    ok({
      success: true,
      traceKey,
      traceUrl: getTraceUrl(traceKey),
    }),
  );
});

traceRoutes.get("/traces/:traceKey", async (c) => {
  const traceKey = c.req.param("traceKey");

  const expires = Number(c.req.query("expires"));
  const signature = c.req.query("signature");

  if (
    !signature ||
    Number.isNaN(expires) ||
    !verifySignedToken(traceKey, expires, signature)
  ) {
    return c.json(
      fail(ERROR_CODES.UNAUTHORIZED, "Invalid or expired trace URL"),
      403,
    );
  }

  try {
    const trace = await readTrace(traceKey);

    return new Response(new Uint8Array(trace), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Length": String(trace.length),
        "Cache-Control": "no-cache",
      },
    });
  } catch {
    return c.json(
      fail(ERROR_CODES.TRACE_UPLOAD_FAILED, "Trace not found"),
      404,
    );
  }
});
