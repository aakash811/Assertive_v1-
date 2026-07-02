import { prisma } from "./prisma";

export async function generateUniqueId(projectId: string) {
  const count = await prisma.testCase.count({
    where: {
      projectId,
    },
  });

  const number = String(count + 1).padStart(3, "0");

  return `TST-${number}`;
}
