import type { SyncTestCase } from "@assertive/shared";

export function findDuplicates(tests: SyncTestCase[]) {
  const seen = new Set<string>();

  const duplicates: string[] = [];

  for (const test of tests) {
    if (seen.has(test.externalId)) {
      duplicates.push(test.externalId);

      continue;
    }

    seen.add(test.externalId);
  }

  return duplicates;
}
