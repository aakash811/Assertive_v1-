import { LocalTraceProvider } from "./local-trace-provider";
import { S3TraceProvider } from "./s3-trace-provider";
import type { TraceProvider } from "./trace-provider";

export function createTraceProvider(): TraceProvider {
  switch (process.env.STORAGE_PROVIDER) {
    case "s3":
      return new S3TraceProvider();

    case "local":
    default:
      return new LocalTraceProvider();
  }
}
