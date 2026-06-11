import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { protectedRoutes } from "./routes/protected";
import { testRoutes } from "./routes/test";
import { apiKeyRoutes } from "./routes/api-keys";
import type { HonoVariables } from "./types/hono";

const app = new Hono<{ Variables: HonoVariables }>();

app.get("/health", (c) => {
  return c.json({
    status: "ok",
  });
});

app.route("/test", testRoutes);

app.route("/api/api-keys", apiKeyRoutes);

app.route("/api", protectedRoutes);

serve({
  fetch: app.fetch,
  port: 4321,
});

console.log("API running on the port 4321");
