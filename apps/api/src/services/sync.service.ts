import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { historyService } from "./history.service";
import type { SyncTestCase } from "@assertive/shared";
import { generateMetadataDiff } from "../utils/history-diff";
import { AppError } from "../lib/app-error";
import { ERROR_CODES } from "@assertive/shared";

function validatePayload(testCases: SyncTestCase[]) {
  const ids = new Set<string>();

  for (const test of testCases) {
    if (!test.externalId?.trim()) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        "Missing externalId",
        400,
      );
    }

    if (ids.has(test.externalId)) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        `Duplicate externalId '${test.externalId}' found in sync payload.`,
        400,
      );
    }

    ids.add(test.externalId);
  }
}

async function resolveSuite(
  projectId: string,
  suiteName?: string,
): Promise<string | undefined> {
  if (!suiteName) {
    return undefined;
  }

  let suite = await prisma.testSuite.findFirst({
    where: {
      projectId,
      name: suiteName,
    },
  });

  if (!suite) {
    suite = await prisma.testSuite.create({
      data: {
        projectId,
        name: suiteName,
      },
    });
  }

  return suite.id;
}

async function syncTags(
  testCaseId: string,
  projectId: string,
  tags: string[],
) {
  await prisma.testCaseTag.deleteMany({
    where: {
      testCaseId,
    },
  });

  for (const tagName of tags) {
   let tag = await prisma.tag.findUnique({
      where: {
        projectId_name: {
          projectId,
          name: tagName,
        },
      },
    });

    if (!tag) {
      tag = await prisma.tag.create({
        data: {
          projectId,
          name: tagName,
        },
      });
    }

    await prisma.testCaseTag.create({
      data: {
        testCaseId,
        tagId: tag.id,
      },
    });
  }
}

async function recordHistory(
  previous: Prisma.TestCaseGetPayload<{}> | undefined,
  current: SyncTestCase,
  dbTestId: string,
) {
  if (!previous) {
    await historyService.created(dbTestId);
    return "created";
  }

  if (previous.syncState === "STALE") {
    await historyService.restored(dbTestId);
    return "restored";
  }

  const changes = generateMetadataDiff(previous, current);

  if (Object.keys(changes).length > 0) {
    await historyService.updated(
      dbTestId,
      changes,
    );
    return "updated";
  }
  return "unchanged";
}

async function markStaleTests(
  existing: Awaited<ReturnType<typeof prisma.testCase.findMany>>,
  incomingIds: Set<string>,
) {
  let stale = 0;

  for (const test of existing) {
    if (incomingIds.has(test.externalId)) {
      continue;
    }

    if (test.syncState === "STALE") {
      continue;
    }

    await prisma.testCase.update({
      where: {
        id: test.id,
      },
      data: {
        syncState: "STALE",
      },
    });

    await historyService.stale(test.id);
    stale++;
  }

  return stale;
}

export const syncService = {
  async sync(projectId: string, testCases: SyncTestCase[]) {
    validatePayload(testCases);
    const existing = await prisma.testCase.findMany({
      where: {
        projectId,
      },
    });

    const incomingIds = new Set(testCases.map((t) => t.externalId));
    const existingMap = new Map(existing.map((test) => [test.externalId, test]));

    let created = 0;
    let updated = 0;
    let restored = 0;
    let stale = 0;

    for (const test of testCases) {
      const previous = existingMap.get(test.externalId);
      const testCaseWhereUnique: Prisma.TestCaseWhereUniqueInput = {
        projectId_externalId: {
          projectId,
          externalId: test.externalId,
        },
      };

      const suiteId = await resolveSuite(
        projectId,
        test.suite,
      );

      const dbTest = await prisma.testCase.upsert({
        where: testCaseWhereUnique,

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
          lifecycle: "ACTIVE"
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
          lifecycle: "ACTIVE"
        },
      });

      const action = await recordHistory(
        previous,
        test,
        dbTest.id,
      );

      switch (action) {
        case "created":
          created++;
          break;

        case "updated":
          updated++;
          break;

        case "restored":
          restored++;
          break;
      }

      await syncTags(
        dbTest.id,
        projectId,
        test.tags,
      );
    }

    stale = await markStaleTests(
      existing,
      incomingIds,
    );

    return {
      synced: testCases.length,
      created,
      updated,
      restored,
      stale,
    };
  },
};
