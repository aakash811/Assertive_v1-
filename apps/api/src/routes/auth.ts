import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ok, fail } from "../lib/api-response";
import { authService } from "../services/auth.service";
import { authMiddleware } from "../middleware/auth";
import type { HonoVariables } from "../types/hono";
import { AppError } from "../lib/app-error";
import { ERROR_CODES } from "@assertive/shared";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  organizationName: z.string().min(1),
});

export const authRoutes = new Hono<{ Variables: HonoVariables }>();

authRoutes.post("/auth/login", zValidator("json", loginSchema), async (c) => {
  const body = c.req.valid("json");
  const result = await authService.login(body.email, body.password);

  return c.json(ok(result));
});

authRoutes.post("/auth/register", zValidator("json", registerSchema), async (c) => {
  const body = c.req.valid("json");
  const result = await authService.register(body.email, body.password, body.name, body.organizationName);

  return c.json(ok(result), 201);
});

authRoutes.use("/auth/me", authMiddleware);

authRoutes.get("/auth/me", async (c) => {
  const userId = c.get("userId");

  if (!userId) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Not authenticated", 401);
  }

  const user = await authService.me(userId);

  return c.json(ok(user));
});

authRoutes.post("/auth/logout", authMiddleware, async (c) => {
  return c.json(ok({ success: true }));
});
