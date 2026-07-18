import { Hono } from "hono";
import { prisma } from "../lib/prisma";

export const testRoutes = new Hono();

testRoutes.get("/", async (c) => {
  const count = await prisma.project.count();

  return c.json({
    projects: count,
  });
});
