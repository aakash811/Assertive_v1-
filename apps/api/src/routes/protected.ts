import { Hono } from "hono";
import { apiKeyAuth } from "../middleware/api-key-auth";
import { HonoVariables } from "../types/hono";
import { testCaseRoutes } from "./test-cases";

export const protectedRoutes = new Hono<{ Variables: HonoVariables }>();

protectedRoutes.use("*", apiKeyAuth);

protectedRoutes.get("/me", async (c) => {
  return c.json({
    projectId: c.get("projectId"),
    apiKeyId: c.get("apiKeyId"),
  });
});

protectedRoutes.route("/test-cases", testCaseRoutes);
