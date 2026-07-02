import fs from "node:fs/promises";
import path from "node:path";

const TRACE_DIRECTORY = path.resolve(
  process.cwd(),
  "..",
  "..",
  "storage",
  "traces",
);

function getTraceFilePath(traceKey: string) {
  return path.join(TRACE_DIRECTORY, `${traceKey}.zip`);
}

export async function saveTrace(traceKey: string, content: ArrayBuffer) {
  await fs.mkdir(TRACE_DIRECTORY, { recursive: true });
  await fs.writeFile(getTraceFilePath(traceKey), Buffer.from(content));
}

export async function readTrace(traceKey: string) {
  return fs.readFile(getTraceFilePath(traceKey));
}

export function getTraceUrl(traceKey: string) {
  const apiUrl = process.env.APP_URL ?? "http://localhost:4321";
  return `${apiUrl}/api/traces/${traceKey}`;
}
