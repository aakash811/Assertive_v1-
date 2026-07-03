import { prisma } from "@assertive/database";
import type { Prisma, TestStatus } from "@prisma/client";

export const testCaseRepository = {
  create(data: {
    externalId: string;
    title: string;
    description?: string;
    projectId: string;
  }) {
    return prisma.testCase.create({
      data,
    });
  },

  async findMany(
    projectId: string,
    filters: {
      page: number;
      limit: number;
      q?: string;
      status?: TestStatus;
      owner?: string;
      tag?: string;
      flaky?: boolean;
      suite?: string;
      syncState?: "SYNCED" | "STALE";
      testType?: string;
    },
  ) {
    const {
      page,
      limit,
      q,
      status,
      owner,
      tag,
      flaky,
      suite,
      syncState,
      testType,
    } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.TestCaseWhereInput = {
      projectId,
    };

    if (q) {
      where.OR = [
        {
          title: {
            contains: q,
            mode: "insensitive",
          },
        },

        {
          externalId: {
            contains: q,
            mode: "insensitive",
          },
        },
      ];
    }

    if (status) {
      where.lastStatus = status;
    }

    if (owner) {
      where.owner = {
        contains: owner,
        mode: "insensitive",
      };
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            name: {
              equals: tag,
              mode: "insensitive",
            },
          },
        },
      };
    }

    if (flaky !== undefined) {
      where.isFlaky = flaky;
    }

    if (suite) {
      where.suite = {
        name: {
          equals: suite,
          mode: "insensitive",
        },
      };
    }

    if (syncState) {
      where.syncState = syncState;
    }

    if (testType) {
      where.testType = {
        equals: testType,
        mode: "insensitive",
      };
    }

    const [items, total] = await Promise.all([
      prisma.testCase.findMany({
        where,

        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },

        orderBy: {
          updatedAt: "desc",
        },

        skip,

        take: limit,
      }),

      prisma.testCase.count({
        where,
      }),
    ]);

    return {
      items,
      total,
    };
  },

  findById(id: string, projectId: string) {
    return prisma.testCase.findFirst({
      where: {
        id,
        projectId,
      },

      include: {
        suite: true,

        tags: {
          include: {
            tag: true,
          },
        },

        runs: {
          orderBy: {
            createdAt: "desc",
          },

          include: {
            runBatch: true,
          },

          take: 10,
        },

        history: {
          orderBy: {
            createdAt: "desc",
          },

          take: 20,
        },
      },
    });
  },

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
    },
    projectId: string,
  ) {
    const existing = await prisma.testCase.findFirst({
      where: {
        id,
        projectId,
      },
    });

    if (!existing) {
      throw new Error("Test case not found");
    }

    return prisma.testCase.update({
      where: {
        id,
      },

      data,
    });
  },

  async delete(id: string, projectId: string) {
    const existing = await prisma.testCase.findFirst({
      where: {
        id,
        projectId,
      },
    });

    if (!existing) {
      throw new Error("Test case not found");
    }

    return prisma.testCase.delete({
      where: {
        id,
      },
    });
  },

  findByExternalId(externalId: string, projectId: string) {
    return prisma.testCase.findFirst({
      where: {
        externalId,
        projectId,
      },
    });
  },
};
