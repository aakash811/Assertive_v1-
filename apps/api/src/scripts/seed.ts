import { prisma } from "@assertive/database";

async function main() {
  const user = await prisma.user.create({
    data: {
      email: "aakash@example.com",
      name: "Aakash",
    },
  });

  const org = await prisma.organization.create({
    data: {
      name: "Assertive",
      slug: "assertive",
    },
  });

  await prisma.organizationMember.create({
    data: {
      userId: user.id,
      orgId: org.id,
      role: "owner",
    },
  });

  const project = await prisma.project.create({
    data: {
      name: "Assertive Demo",
      slug: "assertive-demo",
      organizationId: org.id,
    },
  });

  console.log(project);
}

main();
