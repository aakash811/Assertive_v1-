import { prisma } from "@assertive/database";
import { SyncTestCase } from "@assertive/shared";
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
      lifecycle?: "ACTIVE" | "ARCHIVED";
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
      lifecycle,
      testType,
    } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.TestCaseWhereInput = {
      projectId,
      lifecycle: lifecycle ?? "ACTIVE",
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

  findById(id: string, projectId: string, includeArchived = false) {
    const where: Prisma.TestCaseWhereInput = {
      id,
      projectId,
    };

    if(!includeArchived) {
      where.lifecycle = "ACTIVE";
    }
    return prisma.testCase.findFirst({
      where,
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
        lifecycle: "ACTIVE",
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

  async archive(id: string, projectId: string) {
    const existing = await prisma.testCase.findFirst({
      where: {
        id,
        projectId,
      },
    });

    if (!existing) {
      throw new Error("Test case not found");
    }

    if (existing.lifecycle === "ARCHIVED") {
      throw new Error("Test case already archived");
    }

    return prisma.testCase.update({
      where: {
        id,
      },
      data: {
        lifecycle: "ARCHIVED",
      },
    });
  },

  async restore(id: string, projectId: string) {
    const existing = await prisma.testCase.findFirst({
      where: {
        id,
        projectId,
      },
    });

    if (!existing) {
      throw new Error("Test case not found");
    }

    if (existing.lifecycle === "ACTIVE") {
      throw new Error("Test case already active");
    }

    return prisma.testCase.update({
      where: {
        id,
      },
      data: {
        lifecycle: "ACTIVE",
      },
    });
  },

  findByExternalId(externalId: string, projectId: string, includeArchived = false) {
    const where: Prisma.TestCaseWhereInput = {
      externalId,
      projectId,
    };

    if (!includeArchived) {
      where.lifecycle = "ACTIVE";
    }

    return prisma.testCase.findFirst({
      where,
    });
  },

  findByExternalIds(
    externalIds: string[],
    projectId: string,
    includeArchived = false,
  ) {
    const where: Prisma.TestCaseWhereInput = {
      projectId,
      externalId: {
        in: externalIds,
      },
    };

    if (!includeArchived) {
      where.lifecycle = "ACTIVE";
    }

    return prisma.testCase.findMany({
      where,
    });
  },

  updateExecutionState(
    id: string,
    status: TestStatus,
  ) {
    return prisma.testCase.update({
      where: {
        id,
      },
      data: {
        lastStatus: status,
        isManualOverride: false,
        overrideComment: null,
      },
    });
  },
  
  findByProject(projectId: string) {
    return prisma.testCase.findMany({
      where: {
        projectId,
      },
    });
  },

  upsert(
    projectId: string,
    test: SyncTestCase,
    suiteId?: string,
  ) {
    return prisma.testCase.upsert({
      where: {
        projectId_externalId: {
          projectId,
          externalId: test.externalId,
        },
      },

      create: {
        externalId: test.externalId,
        title: test.title,
        filePath: test.filePath,
        owner: test.owner,
        priority: test.priority,
        testType: test.testType,
        customFields: test.customFields,
        suiteId,
        projectId,
        syncState: "SYNCED",
        lifecycle: "ACTIVE",
      },

      update: {
        title: test.title,
        filePath: test.filePath,
        owner: test.owner,
        priority: test.priority,
        testType: test.testType,
        customFields: test.customFields,
        suiteId,
        syncState: "SYNCED",
        lifecycle: "ACTIVE",
      },
    });
  },

  markStale(id: string) {
    return prisma.testCase.update({
      where: {
        id,
      },
      data: {
        syncState: "STALE",
      },
    });
  },

  findRawById(id: string) {
    return prisma.testCase.findUnique({
      where: { id },
    });
  },

  clearManualOverride(
    id: string,
    status: TestStatus,
  ) {
    return prisma.testCase.update({
      where: { id },
      data: {
        lastStatus: status,
        isManualOverride: false,
        overrideComment: null,
      },
    });
  },

  updateFlakiness(
    id: string,
    score: number,
  ) {
    return prisma.testCase.update({
      where: {
        id,
      },
      data: {
        flakyScore: score,
        isFlaky: score >= 0.3,
      },
    });
  },
};
