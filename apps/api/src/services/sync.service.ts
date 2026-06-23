import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { historyRepository } from "../repositories/history.repository";
import type { SyncTestCase } from "@assertive/shared";
import { generateMetadataDiff } from "../utils/history-diff";

export const syncService = {
  async sync(projectId: string, testCases: SyncTestCase[]) {
    const existing = await prisma.testCase.findMany({
      where: {
        projectId,
      },
    });

    const incomingIds = new Set(testCases.map((t) => t.uniqueId));
    const existingMap = new Map(existing.map((test) => [test.uniqueId, test]));

    let created = 0;
    let updated = 0;
    let restored = 0;
    let stale = 0;

    for (const test of testCases) {
      const previous = existingMap.get(test.uniqueId);
      const testCaseWhereUnique: Prisma.TestCaseWhereUniqueInput = {
        uniqueId: test.uniqueId,
      } as Prisma.TestCaseWhereUniqueInput;

      let suiteId: string | undefined;

      if (test.suite) {
        let suite = await prisma.testSuite.findFirst({
          where: {
            projectId,
            name: test.suite,
          },
        });

        if (!suite) {
          suite = await prisma.testSuite.create({
            data: {
              projectId,
              name: test.suite,
            },
          });
        }

        suiteId = suite.id;
      }

      const dbTest = await prisma.testCase.upsert({
        where: testCaseWhereUnique,

        create: {
          uniqueId: test.uniqueId,
          title: test.title,
          filePath: test.filePath,
          owner: test.owner,
          priority: test.priority,
          testType: test.testType,
          customFields: test.customFields,
          suiteId,
          projectId,
          syncState: "SYNCED",
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
        },
      });

      // HISTORY
      if (!previous) {
        await historyRepository.create({
          testCaseId: dbTest.id,
          action: "CREATED",
        });
        created++;
      } else if (previous.syncState === "STALE") {
        await historyRepository.create({
          testCaseId: dbTest.id,
          action: "RESTORED",
        });
        restored++;
      } else {
        const changes = generateMetadataDiff(previous, test);

        const hasChanges = Object.keys(changes).length > 0;

        if (hasChanges) {
          await historyRepository.create({
            testCaseId: dbTest.id,
            action: "UPDATED",
            changes,
          });
          updated++;
        }
      }

      // TAGS

      await prisma.testCaseTag.deleteMany({
        where: {
          testCaseId: dbTest.id,
        },
      });

      for (const tagName of test.tags) {
        let tag = await prisma.tag.findFirst({
          where: {
            projectId,
            name: tagName,
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
            testCaseId: dbTest.id,
            tagId: tag.id,
          },
        });
      }
    }

    // STALE TESTS

    for (const test of existing) {
      if (!incomingIds.has(test.uniqueId)) {
        if (test.syncState !== "STALE") {
          await prisma.testCase.update({
            where: {
              id: test.id,
            },
            data: {
              syncState: "STALE",
            },
          });
          stale++;

          await historyRepository.create({
            testCaseId: test.id,
            action: "STALE",
          });
        }
      }
    }

    return {
      synced: testCases.length,
      created,
      updated,
      restored,
      stale,
    };
  },
};
