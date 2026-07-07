import type { CleanupPolicy } from "./cleanup-policy";

export class CleanupEngine {
  constructor(private readonly policies: CleanupPolicy[]) {}

  async run() {
    const results: Record<string, number> = {};

    for (const policy of this.policies) {
      if (!policy.enabled) {
        continue;
      }

      results[policy.name] = await policy.execute();
    }

    return results;
  }
}
