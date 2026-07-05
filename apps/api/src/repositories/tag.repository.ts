import { prisma } from "../lib/prisma";

export const tagRepository = {
  async findOrCreate(
    projectId: string,
    name: string,
  ) {
    let tag = await prisma.tag.findUnique({
      where: {
        projectId_name: {
          projectId,
          name,
        },
      },
    });

    if (!tag) {
      tag = await prisma.tag.create({
        data: {
          projectId,
          name,
        },
      });
    }

    return tag;
  },
};