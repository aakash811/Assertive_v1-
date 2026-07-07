import fs from "node:fs/promises";
import path from "node:path";

import type { TraceProvider } from "./trace-provider";

const TRACE_DIRECTORY = path.resolve(
  process.cwd(),
  "..",
  "..",
  "storage",
  "traces",
);

export class LocalTraceProvider implements TraceProvider {
  private getFilePath(traceKey: string) {
    return path.join(TRACE_DIRECTORY, `${traceKey}.zip`);
  }

  async save(traceKey: string, content: ArrayBuffer) {
    await fs.mkdir(TRACE_DIRECTORY, {
      recursive: true,
    });

    await fs.writeFile(this.getFilePath(traceKey), Buffer.from(content));
  }

  read(traceKey: string) {
    return fs.readFile(this.getFilePath(traceKey));
  }

  getUrl(traceKey: string, expires: number, signature: string) {
    const apiUrl = process.env.APP_URL ?? "http://localhost:4321";

    return `${apiUrl}/api/traces/${traceKey}?expires=${expires}&signature=${signature}`;
  }
}
