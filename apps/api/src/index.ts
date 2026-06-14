import { Hono } from "hono";
import { serve } from "@hono/node-server";
import type { HonoVariables } from "./types/hono";
import { protectedRoutes } from "./routes/protected";
import { testRoutes } from "./routes/test";
import { apiKeyRoutes } from "./routes/api-keys";
import { historyRoutes } from "./routes/history";
import { tagRoutes } from "./routes/tags";
import { testSuiteRoutes } from "./routes/test-suite";
import { manualOverrideRoutes } from "./routes/manual-override";
import { syncRoutes } from "./routes/sync";
import { projectRoutes } from "./routes/project";
import { cors } from "hono/cors";

const app = new Hono<{ Variables: HonoVariables }>();

app.use(
  "*",
  cors({
    origin: "http://localhost:3000",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/health", (c) => {
  return c.json({
    status: "ok",
  });
});

app.route("/test", testRoutes);

app.route("/api/api-keys", apiKeyRoutes);

app.route("/api/project", projectRoutes);

app.route("/api", historyRoutes);

app.route("/api/tags", tagRoutes);

app.route("/api/test-suites", testSuiteRoutes);

app.route("/api/manual-overrides", manualOverrideRoutes);

app.route("/api/sync", syncRoutes);

app.route("/api", protectedRoutes);

serve({
  fetch: app.fetch,
  port: 4321,
});

console.log("API running on the port 4321");
