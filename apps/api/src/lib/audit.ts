import { logger } from "./logger";

export const audit = {
  log(event: string, metadata: Record<string, unknown>) {
    logger.info(`[AUDIT] ${event}`, metadata);
  },
};
