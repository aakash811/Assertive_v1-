import { Hono } from "hono";
import { apiKeyAuth } from "../middleware/api-key-auth";
import { randomUUID } from "node:crypto";
import { readTrace, saveTrace, getTraceUrl } from "../lib/trace-storage";
import { ok, fail } from "../lib/api-response";
import { ERROR_CODES } from "@assertive/shared";

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

  try {
    const trace = await readTrace(traceKey);

    return new Response(trace, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Length": String(trace.length),
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return c.json(
      fail(ERROR_CODES.TRACE_UPLOAD_FAILED, "Trace not found"),
      404,
    );
  }
});
