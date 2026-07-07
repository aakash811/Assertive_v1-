export type LogLevel = "info" | "warn" | "error";

type Metadata = Record<string, unknown>;

function log(level: LogLevel, message: string, metadata?: Metadata) {
  console.log(
    JSON.stringify({
      level,
      message,
      timestamp: new Date().toISOString(),
      ...metadata,
    }),
  );
}

export const logger = {
  info(message: string, metadata?: Metadata) {
    log("info", message, metadata);
  },

  warn(message: string, metadata?: Metadata) {
    log("warn", message, metadata);
  },

  error(message: string, metadata?: Metadata) {
    log("error", message, metadata);
  },
};
