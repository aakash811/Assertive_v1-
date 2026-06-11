import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const testRoutes = new Hono();

testRoutes.get("/", async (c) => {
  const count = await prisma.project.count();

  return c.json({
    projects: count,
  });
});
