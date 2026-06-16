import crypto from "node:crypto";
import { prisma } from "./client";

export async function seedDatabase() {
  const rawKey = "ask_live_" + crypto.randomBytes(16).toString("hex");
  const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");
  const project = await prisma.project.findFirst();

  if (!project) {
    throw new Error("No Project Found");
  }

  await prisma.apiKey.create({
    data: {
      name: "local-dev",
      hashedKey,
      projectId: project.id,
    },
  });

  return rawKey;
}
