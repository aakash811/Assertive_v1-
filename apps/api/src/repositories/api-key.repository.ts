import { prisma } from "@assertive/database";

export const apiKeyRepository = {
  create(data: {
    name: string;
    hashedKey: string;
    projectId: string;
    expiresAt?: Date;
  }) {
    return prisma.apiKey.create({
      data,
    });
  },

  findMany(projectId: string) {
    return prisma.apiKey.findMany({
      where: {
        projectId,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  revoke(id: string) {
    return prisma.apiKey.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });
  },
};
