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
  const suite = await testSuiteRepository.findOrCreate(
    projectId,
    suiteName,
  );

  return suite?.id;
}

async function syncTags(
  testCaseId: string,
  projectId: string,
  tags: string[],
) {
  const tagIds: string[] = [];

  for (const tagName of tags) {
    const tag = await tagRepository.findOrCreate(
      projectId,
      tagName,
    );

    tagIds.push(tag.id);
  }

  await testCaseTagRepository.replaceTags(
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
  async sync(projectId: string, testCases: SyncTestCase[]) {
    validatePayload(testCases);
   const existing = await testCaseRepository.findByProject(projectId);

    const incomingIds = new Set(testCases.map((t) => t.externalId));
    const existingMap = new Map(existing.map((test) => [test.externalId, test]));

    let created = 0;
    let updated = 0;
    let restored = 0;
    let stale = 0;

    for (const test of testCases) {
      const previous = existingMap.get(test.externalId);

      const suiteId = await resolveSuite(
        projectId,
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
