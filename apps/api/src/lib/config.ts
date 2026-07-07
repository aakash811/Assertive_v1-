export const config = {
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
