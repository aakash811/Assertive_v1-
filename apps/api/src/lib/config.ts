type Config = {
  port: number;
  nodeEnv: string;
  appUrl: string;
  storageProvider: string;
  jwtSecret?: string;
  retention: {
    runs: string;
    history: string;
    traces: string;
  };
};

export const config: Config = {
  port: Number(process.env.PORT ?? 4321),
  nodeEnv: process.env.NODE_ENV ?? "development",
  appUrl: process.env.APP_URL ?? "http://localhost:4321",
  storageProvider: process.env.STORAGE_PROVIDER ?? "local",
  retention: {
    runs: process.env.RETENTION_RUNS ?? "90d",
    history: process.env.RETENTION_HISTORY ?? "1y",
    traces: process.env.RETENTION_TRACES ?? "30d",
  },
};

export function validateConfig() {
  const missing: string[] = [];

  if (!process.env.DATABASE_URL) {
    missing.push("DATABASE_URL");
  }

  if (config.storageProvider === "s3") {
    if (!process.env.S3_BUCKET) {
      missing.push("S3_BUCKET");
    }

    if (!process.env.S3_ACCESS_KEY_ID) {
      missing.push("S3_ACCESS_KEY_ID");
    }

    if (!process.env.S3_SECRET_ACCESS_KEY) {
      missing.push("S3_SECRET_ACCESS_KEY");
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
}
