import { prisma } from "@assertive/database";

export const projectRepository = {
  findMany({ organizationId }: { organizationId: string }) {
    return prisma.project.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  },

  findById(id: string) {
    return prisma.project.findUnique({
      where: {
        id,
      },
    });
  },

  create(data: { name: string; slug: string; organizationId: string }) {
    return prisma.project.create({
      data,
    });
  },

  update(id: string, name: string) {
    return prisma.project.update({
      where: {
        id,
      },

      data: {
        name,
      },
    });
  },

  delete(id: string) {
    return prisma.project.delete({
      where: {
        id,
      },
    });
  },
};
