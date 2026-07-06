import { testCaseRepository } from "../repositories/test-case.repository";
import { testSuiteRepository } from "../repositories/test-suite.repository";
import { tagRepository } from "../repositories/tag.repository";
import { testCaseTagRepository } from "../repositories/test-case-tag.repository";
import { Prisma } from "@prisma/client";
import { historyService } from "./history.service";
import type { SyncTestCase } from "@assertive/shared";
import { generateMetadataDiff } from "../utils/history-diff";
import { AppError } from "../lib/app-error";
import { ERROR_CODES } from "@assertive/shared";
import { syncLockService } from "./sync-lock.service";

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
  suiteCache: Map<string, string>,
  suiteName?: string,
): Promise<string |undefined> {
  if (!suiteName) {
    return undefined;
  }

  const cached = suiteCache.get(suiteName);

  if (cached) {
    return cached;
  }

  const suite = await testSuiteRepository.create({
    projectId,
    name: suiteName,
  });

  suiteCache.set(suite.name, suite.id);

  return suite.id;
}

async function syncTags(
  testCaseId: string,
  projectId: string,
  tags: string[],
  tagCache: Map<string, string>,
) {
  const tagIds: string[] = [];

  for (const tagName of tags) {
    let tagId = tagCache.get(tagName);

    if (!tagId) {
      const tag = await tagRepository.create({
        projectId,
        name: tagName,
      });

      tagId = tag.id;
      tagCache.set(tag.name, tag.id);
    }

    tagIds.push(tagId);
  }

  await testCaseTagRepository.syncTags(
    testCaseId,
    tagIds,
  );
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
  existing: Awaited<ReturnType<typeof testCaseRepository.findByProject>>,
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

    await testCaseRepository.markStale(test.id);

    await historyService.stale(test.id);
    stale++;
  }

  return stale;
}

export const syncService = {
  async sync(
    projectId: string,
    testCases: SyncTestCase[],
  ) {
    if (!syncLockService.acquire(projectId)) {
      throw new AppError(
        ERROR_CODES.CONFLICT,
        "A Sync is already running for this project.",
        409,
      );
    }
    
    try{
      return testCaseRepository.withTransaction(async () => {
        validatePayload(testCases);

        const existing =
          await testCaseRepository.findByProject(projectId);
        
        const suites =
          await testSuiteRepository.findByProject(projectId);
        const suiteCache = new Map(
          suites.map((suite) => [suite.name, suite.id]),
        );

        const tags =
          await tagRepository.findByProject(projectId);
        const tagCache = new Map(
          tags.map((tag) => [tag.name, tag.id]),
        );

        const incomingIds = new Set(
          testCases.map((t) => t.externalId),
        );

        const existingMap = new Map(
          existing.map((test) => [test.externalId, test]),
        );

        let created = 0;
        let updated = 0;
        let restored = 0;
        let stale = 0;

        for (const test of testCases) {
          const previous = existingMap.get(test.externalId);

          const suiteId = await resolveSuite(
            projectId,
            suiteCache,
            test.suite,
          );

          const dbTest = await testCaseRepository.upsert(
            projectId,
            test,
            suiteId,
          );

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
            tagCache,
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
      });
    } finally {
      syncLockService.release(projectId);
    }
  },
};
