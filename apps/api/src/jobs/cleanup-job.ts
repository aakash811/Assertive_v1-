import { cleanupService } from "../services/cleanup.service";

export async function cleanupJob() {
  try {
    const result = await cleanupService.run();

    console.log("[Cleanup]", result);
  } catch (error) {
    console.error(
      "[Cleanup] Job failed:",
      error instanceof Error ? error.message : error,
    );
  }
}
