import { prisma } from "@assertive/database";

async function main() {
  let organization = await prisma.organization.findUnique({
    where: {
      slug: "local-org",
    },
  });

  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        name: "Local Organization",
        slug: "local-org",
      },
    });
  }

  let user = await prisma.user.findUnique({
    where: {
      email: "owner@assertive.local",
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "owner@assertive.local",
        name: "Local Owner",
      },
    });
  }

  const membership = await prisma.organizationMember.findFirst({
    where: {
      userId: user.id,

      orgId: organization.id,
    },
  });

  if (!membership) {
    await prisma.organizationMember.create({
      data: {
        userId: user.id,

        orgId: organization.id,

        role: "owner",
      },
    });
  }

  let project = await prisma.project.findUnique({
    where: {
      slug: "assertive-local",
    },
  });

  if (!project) {
    await prisma.project.create({
      data: {
        name: "Assertive Local",
        slug: "assertive-local",

        organizationId: organization.id,
      },
    });
  }

  console.log("✓ Seed complete");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
