export interface ReporterConfig {
  apiUrl: string;
  apiKey: string;

  environment?: string;

  uploadTraces?: boolean;

  retries?: number;
}

export const defaultConfig = {
  environment: "local",
  uploadTraces: false,
  retries: 3,
};

export function resolveConfig(
  config: Partial<ReporterConfig> = {},
): ReporterConfig {
  const resolved = {
    apiUrl:
      config.apiUrl ?? process.env.ASSERTIVE_API_URL ?? "http://localhost:4321",

    apiKey: config.apiKey ?? process.env.ASSERTIVE_API_KEY ?? "",

    environment: config.environment ?? defaultConfig.environment,

    uploadTraces: config.uploadTraces ?? defaultConfig.uploadTraces,

    retries: config.retries ?? defaultConfig.retries,
  };

  return resolved;
}
