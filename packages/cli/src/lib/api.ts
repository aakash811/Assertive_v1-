import { loadConfig } from "../utils/load-config";

function validateConfig() {
  const config = loadConfig();

  if (!config.apiUrl) {
    throw new Error("apiUrl is missing");
  }

  if (!config.apiKey) {
    throw new Error("apiKey is missing");
  }

  return config;
}

export async function apiPost(path: string, body?: unknown) {
  const config = validateConfig();

  const response = await fetch(`${config.apiUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

export async function apiGet(path: string) {
  const config = validateConfig();

  const response = await fetch(`${config.apiUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}
