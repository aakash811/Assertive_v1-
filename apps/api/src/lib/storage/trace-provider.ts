export interface TraceProvider {
  save(traceKey: string, content: ArrayBuffer): Promise<void>;

  read(traceKey: string): Promise<Buffer>;

  getUrl(traceKey: string, expires: number, signature: string): string;

  delete(traceKey: string): Promise<void>;

  list(prefix?: string): Promise<string[]>;
}
