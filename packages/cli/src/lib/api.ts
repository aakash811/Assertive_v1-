import { loadAssertiveConfig } from "@assertive/shared";
import { findProjectRoot } from "../utils/find-project-root";

function validateConfig() {
  const root = findProjectRoot();

  const config = loadAssertiveConfig(root);

  if (!config.apiUrl) {
    throw new Error("apiUrl is missing");
  }

  if (!config.apiKey) {
    throw new Error("apiKey is missing");
  }

  return config;
}

async function request(path: string, init?: RequestInit) {
  const config = validateConfig();

  const response = await fetch(`${config.apiUrl}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${config.apiKey}`,
    },
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(
      json.success
        ? response.statusText
        : (json.error?.message ?? response.statusText),
    );
  }

  return json.data;
}

export function apiGet(path: string) {
  return request(path);
}

export function apiPost(path: string, body?: unknown) {
  return request(path, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}
