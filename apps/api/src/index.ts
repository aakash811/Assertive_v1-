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
import { statusRoutes } from "./routes/status";
import { cleanupRoutes } from "./routes/cleanup";
import { traceRoutes } from "./routes/traces";
import { prisma } from "./lib/prisma";
import { fail } from "./lib/api-response";
import { AppError } from "./lib/app-error";
import { ERROR_CODES } from "@assertive/shared";
import { ZodError } from "zod";
import { projectsRoutes } from "./routes/projects";

const app = new Hono<{ Variables: HonoVariables }>();

app.use(
  "*",
  cors({
    origin: "http://localhost:3000",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.onError((error, c) => {
  if (error instanceof AppError) {
    return c.json(
      fail(error.code, error.message, error.details),
      error.status as 400 | 401 | 403 | 404 | 500,
    );
  }

  if (error instanceof ZodError) {
    return c.json(
      fail(ERROR_CODES.VALIDATION_ERROR, "Validation failed", error.flatten()),
      400,
    );
  }

  console.error(error);

  return c.json(
    fail(ERROR_CODES.INTERNAL_SERVER_ERROR, "Internal server error"),
    500,
  );
});

app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.route("/test", testRoutes);

app.route("/api/api-keys", apiKeyRoutes);

app.route("/api/projects", projectsRoutes);

app.route("/api/project", projectRoutes);

app.route("/api", historyRoutes);

app.route("/api/tags", tagRoutes);

app.route("/api/test-suites", testSuiteRoutes);

app.route("/api/manual-overrides", manualOverrideRoutes);

app.route("/api/sync", syncRoutes);

app.route("/api", traceRoutes);

app.route("/api/status", statusRoutes);

app.route("/api", cleanupRoutes);

app.route("/api", protectedRoutes);

const server = serve({
  fetch: app.fetch,
  port: 4321,
});

console.log("API running on port 4321");

async function shutdown() {
  console.log("Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);

process.on("SIGTERM", shutdown);

console.log("API running on the port 4321");
