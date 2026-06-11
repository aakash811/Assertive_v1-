import { Hono } from "hono";
import { apiKeyAuth } from "../middleware/api-key-auth";
import { HonoVariables } from "../types/hono";
import { testCaseRoutes } from "./test-cases";
import { testRunRoutes } from "./test-run";
import { runBatchRoutes } from "./run-batches";

export const protectedRoutes = new Hono<{ Variables: HonoVariables }>();

protectedRoutes.use("*", apiKeyAuth);

protectedRoutes.get("/me", async (c) => {
  return c.json({
    projectId: c.get("projectId"),
    apiKeyId: c.get("apiKeyId"),
  });
});

protectedRoutes.route("/test-cases", testCaseRoutes);

protectedRoutes.route("/run-batches", runBatchRoutes);

protectedRoutes.route("/test-runs", testRunRoutes);
