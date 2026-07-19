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
import { CleanupScheduler } from "./lib/cleanup/scheduler";
import { cleanupJob } from "./jobs/cleanup-job";
import { requestIdMiddleware } from "./middleware/request-id";
import { requestLogger } from "./middleware/request-logger";
import { bodySizeLimit } from "./middleware/body-size-limit";
import { logger } from "./lib/logger";
import { healthRoutes } from "./routes/health";
import { config, validateConfig } from "./lib/config";

validateConfig();
import { authRoutes } from "./routes/auth";
import { invitationRoutes } from "./routes/invitations";

const app = new Hono<{ Variables: HonoVariables }>();

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://trace.playwright.dev"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("*", requestIdMiddleware);
app.use("*", requestLogger);
app.use("*", bodySizeLimit);

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

  logger.error("Unhandled exception", {
    requestId: c.get("requestId"),
    error: error instanceof Error ? error.message : String(error),
  });

  return c.json(
    fail(ERROR_CODES.INTERNAL_SERVER_ERROR, "Internal server error"),
    500,
  );
});

app.route("/api/health", healthRoutes);

app.route("/api", authRoutes);

app.route("/test", testRoutes);

app.route("/api/api-keys", apiKeyRoutes);

app.route("/api/projects", projectsRoutes);

app.route("/api/project", projectRoutes);

app.route("/api", historyRoutes);

app.route("/api/tags", tagRoutes);

app.route("/api/test-suites", testSuiteRoutes);

app.route("/api/manual-overrides", manualOverrideRoutes);

app.route("/api/sync", syncRoutes);

app.route("/api/projects/:id/sync", syncRoutes);

app.route("/api", traceRoutes);

app.route("/api/status", statusRoutes);

app.route("/api", cleanupRoutes);

app.route("/api", protectedRoutes);

app.route("/api/invitations", invitationRoutes);

const server = serve({
  fetch: app.fetch,
  port: config.port,
});

export { app };

const scheduler = new CleanupScheduler(
  cleanupJob,
  24 * 60 * 60 * 1000, // daily
);

scheduler.start();

logger.info("API started", {
  port: config.port,
  environment: config.nodeEnv,
});

async function shutdown() {
  logger.info("Shutdown requested");
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);

process.on("SIGTERM", shutdown);
