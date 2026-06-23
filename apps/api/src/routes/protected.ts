import { Hono } from "hono";
import { ok } from "../lib/api-response";
import { apiKeyAuth } from "../middleware/api-key-auth";
import { HonoVariables } from "../types/hono";
import { testCaseRoutes } from "./test-cases";
import { testRunRoutes } from "./test-run";
import { runBatchRoutes } from "./run-batches";
import { metricsRoutes } from "./metrics";
import { analyticsRoutes } from "./analytics";
import { organizationRoutes } from "./organization";

export const protectedRoutes = new Hono<{ Variables: HonoVariables }>();

protectedRoutes.use("*", apiKeyAuth);

protectedRoutes.get("/me", async (c) => {
  return c.json(
    ok({
      projectId: c.get("projectId"),
      apiKeyId: c.get("apiKeyId"),
    }),
  );
});

protectedRoutes.route("/test-cases", testCaseRoutes);

protectedRoutes.route("/metrics", metricsRoutes);

protectedRoutes.route("/run-batches", runBatchRoutes);

protectedRoutes.route("/test-runs", testRunRoutes);

protectedRoutes.route("/analytics", analyticsRoutes);

protectedRoutes.route("/organization", organizationRoutes);
