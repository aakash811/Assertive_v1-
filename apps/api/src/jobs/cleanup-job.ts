import { auditService } from "../services/audit.service";
import { cleanupService } from "../services/cleanup.service";

export async function cleanupJob() {
  try {
    const result = await cleanupService.run();

    auditService.cleanup(result);
  } catch (error) {
    console.error(
      "[Cleanup] Job failed:",
      error instanceof Error ? error.message : error,
    );
  }
}
