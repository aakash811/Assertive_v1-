import { hashFile, readCache, writeCache } from "./sync-cache.js";

export function getChangedFiles(files: { absolutePath: string }[]) {
  const cache = readCache();

  const changed: string[] = [];

  for (const file of files) {
    const hash = hashFile(file.absolutePath);

    const previousHash = cache[file.absolutePath]?.hash;

    if (previousHash !== hash) {
      changed.push(file.absolutePath);
    }
  }

  const existingFiles = new Set(files.map((f) => f.absolutePath));

  for (const filePath of Object.keys(cache)) {
    if (!existingFiles.has(filePath)) {
      delete cache[filePath];
    }
  }

  writeCache(cache);

  return changed;
}
