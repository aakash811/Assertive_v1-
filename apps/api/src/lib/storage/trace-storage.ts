import { LocalTraceProvider } from "./local-trace-provider";
import { createTraceProvider } from "./storage-factory";
import { createSignedToken } from "./trace-signing";

const provider = createTraceProvider();

export function saveTrace(traceKey: string, content: ArrayBuffer) {
  return provider.save(traceKey, content);
}

export function readTrace(traceKey: string) {
  return provider.read(traceKey);
}

export function getTraceUrl(traceKey: string) {
  const { expires, signature } = createSignedToken(traceKey);

  return provider.getUrl(traceKey, expires, signature);
}
