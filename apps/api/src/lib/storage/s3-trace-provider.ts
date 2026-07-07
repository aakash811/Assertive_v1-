import type { TraceProvider } from "./trace-provider";

export class S3TraceProvider implements TraceProvider {
  async save(): Promise<void> {
    throw new Error("S3 trace storage not implemented.");
  }

  async read(): Promise<Buffer> {
    throw new Error("S3 trace storage not implemented.");
  }

  getUrl(): string {
    throw new Error("S3 trace storage not implemented.");
  }
}
