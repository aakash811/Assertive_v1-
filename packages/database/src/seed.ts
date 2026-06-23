import crypto from "node:crypto";
import { prisma } from "./client";

export async function seedDatabase() {
  let organization = await prisma.organization.findFirst();

  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        name: "Local Organization",
        slug: "local-org",
      },
    });
  }

  let project = await prisma.project.findFirst({
    where: {
      organizationId: organization.id,
    },
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        name: "Assertive Local",
        slug: "assertive-local",
        organizationId: organization.id,
      },
    });
  }

  const existingKey = await prisma.apiKey.findFirst({
    where: {
      organizationId: organization.id,
      name: "local-dev",
    },
  });

  if (existingKey) {
    return null;
  }

  const rawKey = "ask_live_" + crypto.randomBytes(16).toString("hex");
  const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");

  await prisma.apiKey.create({
    data: {
      name: "local-dev",
      hashedKey,
      organizationId: organization.id,
    },
  });

  return rawKey;
}
