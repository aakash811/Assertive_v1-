export const API_SCOPES = {
  PROJECTS_READ: "projects:read",

  TESTS_READ: "tests:read",

  TESTS_WRITE: "tests:write",

  RUNS_READ: "runs:read",

  RUNS_WRITE: "runs:write",

  API_KEYS_READ: "api-keys:read",

  API_KEYS_WRITE: "api-keys:write",
} as const;

export type ApiScope = (typeof API_SCOPES)[keyof typeof API_SCOPES];
