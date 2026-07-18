import { prisma } from "../lib/prisma";
import { runBatchRepository } from "../repositories/run-batch.repository";
import { AppError } from "../lib/app-error";
import { ERROR_CODES } from "@assertive/shared";
import {
  BatchUploadResult,
  CreateRunBatchDto,
} from "../validators/run-batch.validator";
import { executionEngineService } from "./execution-engine.service";

export const runBatchService = {
  create(projectId: string, data: CreateRunBatchDto) {
    return runBatchRepository.create({
      ...data,
      projectId,
    });
  },

  list(projectId: string, filters: {
    page: number;
    limit: number;
    q?: string;
    environment?: string;
    triggeredBy?: string;
  }) {
    return runBatchRepository.findMany(projectId, filters);
  },

  get(id: string, projectId: string) {
    return runBatchRepository.findById(id, projectId);
  },

  async upload(
    batchId: string,
    projectId: string,
    results: BatchUploadResult[],
  ) {
    if (results.length === 0) {
      return {
        uploaded: 0,
      };
    }

    return prisma.$transaction(async () => {
      const batch = await runBatchRepository.findUploadState(
        batchId,
        projectId,
      );

      if (!batch) {
        throw new AppError(
          ERROR_CODES.RUN_BATCH_NOT_FOUND,
          "Run batch not found",
          404,
        );
      }

      if (batch.uploadCompleted) {
        return {
          uploaded: 0,
        };
      }

      const uploaded = await executionEngineService.execute(
        batchId,
        projectId,
        results,
      );

      await runBatchRepository.markUploaded(batchId);

      return {
        uploaded,
      };
    });
  },
};