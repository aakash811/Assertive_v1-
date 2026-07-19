import { prisma } from "../lib/prisma";

export type UniqueIdResult = {
  id: string;
  externalId: string;
};

export const idGenerationService = {
  async generateUniqueId(projectId: string): Promise<UniqueIdResult> {
    const project = await prisma.project.update({
      where: { id: projectId },
      data: { idCounter: { increment: 1 } },
      select: { idPrefix: true, idCounter: true },
    });

    const externalId = `${project.idPrefix}-${String(project.idCounter).padStart(3, "0")}`;

    return {
      id: projectId,
      externalId,
    };
  },
};
