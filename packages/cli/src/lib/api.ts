import { loadConfig } from "../utils/load-config";

export async function apiPost(path: string, body: unknown) {
  const config = loadConfig();

  const response = await fetch(`${config.apiUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

export async function apiGet(path: string) {
  const config = loadConfig();

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
