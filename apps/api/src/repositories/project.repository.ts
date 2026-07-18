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

  findById(id: string, organizationId: string) {
    return prisma.project.findUnique({
      where: {
        id,
      },
    }).then((project) => {
      if (!project || project.organizationId !== organizationId) {
        return null;
      }

      return project;
    });
  },

  create(data: {
    name: string;
    slug: string;
    organizationId: string;
  }) {
    return prisma.project.create({
      data,
    });
  },

  update(
    id: string,
    organizationId: string,
    name: string,
  ) {
    return prisma.project.updateMany({
      where: {
        id,
        organizationId,
      },
      data: {
        name,
      },
    });
  },

  delete(id: string, organizationId: string) {
    return prisma.project.deleteMany({
        where:{
            id,
            organizationId,
        }
    });
  },
};
