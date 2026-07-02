import type { TestMetadata } from "./metadata";

export const metadataStore = new Map<string, TestMetadata>();

export function flush(testName: string) {
  const metadata = metadataStore.get(testName);
  metadataStore.delete(testName);

  return metadata;
}
