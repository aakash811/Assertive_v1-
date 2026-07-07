export interface TraceProvider {
  save(traceKey: string, content: ArrayBuffer): Promise<void>;

  read(traceKey: string): Promise<Buffer>;

  getUrl(traceKey: string, expires: number, signature: string): string;
}
