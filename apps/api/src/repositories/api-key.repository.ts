import { prisma } from "@assertive/database";

export const apiKeyRepository = {
  create(data: {
    name: string;
    hashedKey: string;
    organizationId: string;
    expiresAt?: Date;
  }) {
    return prisma.apiKey.create({
      data,
    });
  },

  findMany(organizationId: string) {
    return prisma.apiKey.findMany({
      where: {
        organizationId,
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
