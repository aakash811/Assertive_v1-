import { Prisma } from "@prisma/client";
import {
  ERROR_CODES,
  HISTORY_ACTIONS,
  type HistoryAction,
} from "@assertive/shared";
import { historyRepository } from "../repositories/history.repository";
import { testCaseRepository } from "../repositories/test-case.repository";
import { AppError } from "../lib/app-error";

export const historyService = {
  create(
    testCaseId: string,
    action: HistoryAction,
    options?: {
      changes?: Prisma.InputJsonValue;
      comment?: string;
      changedBy?: string;
    },
  ) {
    return historyRepository.create({
      testCaseId,
      action,
      ...options,
    });
  },

  created(testCaseId: string) {
    return this.create(testCaseId, HISTORY_ACTIONS.CREATED);
  },

  updated(
    testCaseId: string,
    changes: Prisma.InputJsonValue,
  ) {
    return this.create(testCaseId, HISTORY_ACTIONS.UPDATED, {
      changes,
    });
  },

  restored(testCaseId: string) {
    return this.create(testCaseId, HISTORY_ACTIONS.RESTORED);
  },

  stale(testCaseId: string) {
    return this.create(testCaseId, HISTORY_ACTIONS.STALE);
  },

  statusChanged(
    testCaseId: string,
    changes: Prisma.InputJsonValue,
  ) {
    return this.create(testCaseId, HISTORY_ACTIONS.STATUS_CHANGED, {
      changes,
    });
  },

  manualOverride(
    testCaseId: string,
    comment: string,
    changes: Prisma.InputJsonValue,
  ) {
    return this.create(
      testCaseId,
      HISTORY_ACTIONS.MANUAL_OVERRIDE,
      {
        comment,
        changes,
      },
    );
  },

  manualOverrideCleared(testCaseId: string) {
    return this.create(
      testCaseId,
      HISTORY_ACTIONS.MANUAL_OVERRIDE_CLEARED,
    );
  },

  list(testCaseId: string, page: number, limit: number) {
    return historyRepository.list(testCaseId, page, limit);
  },

  async listByExternalId(
    projectId: string,
    externalId: string,
    page: number,
    limit: number,
  ) {
    const testCase =
      await testCaseRepository.findByExternalId(
        externalId,
        projectId,
      );

    if (!testCase) {
      throw new AppError(
        ERROR_CODES.TEST_CASE_NOT_FOUND,
        "Test case not found",
        404,
      );
    }

    return historyRepository.list(testCase.id, page, limit);
  },

  archived(testCaseId: string) {
    return this.create(
        testCaseId,
        HISTORY_ACTIONS.ARCHIVED,
    );
  }
};