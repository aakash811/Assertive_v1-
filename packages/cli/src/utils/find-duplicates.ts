import type { SyncTestCase } from "@assertive/shared";

export function findDuplicates(tests: SyncTestCase[]) {
  const seen = new Set<string>();

  const duplicates: string[] = [];

  for (const test of tests) {
    if (seen.has(test.uniqueId)) {
      duplicates.push(test.uniqueId);

      continue;
    }

    seen.add(test.uniqueId);
  }

  return duplicates;
}
