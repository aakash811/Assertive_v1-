import { prisma } from "../lib/prisma";

export const organizationRepository = {
  findById(id: string) {
    return prisma.organization.findUnique({
      where: {
        id,
      },
    });
  },

  findMembers(organizationId: string) {
    return prisma.organizationMember.findMany({
      where: {
        orgId: organizationId,
      },

      include: {
        user: true,
      },

      orderBy: {
        role: "asc",
      },
    });
  },
};
