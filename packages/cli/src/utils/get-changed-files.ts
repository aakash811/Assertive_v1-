import { hashFile } from "./sync-cache.js";
import { readCache, writeCache } from "./sync-cache.js";

export function getChangedFiles(files: { absolutePath: string }[]) {
  const cache = readCache();
  const changed: string[] = [];
  const updated = { ...cache };

  for (const file of files) {
    const hash = hashFile(file.absolutePath);
    if (cache[file.absolutePath] !== hash) {
      changed.push(file.absolutePath);
    }

    updated[file.absolutePath] = hash;
  }

  writeCache(updated);
  return changed;
}
