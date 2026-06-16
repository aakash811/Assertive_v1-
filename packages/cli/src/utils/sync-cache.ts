import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { findProjectRoot } from "./find-project-root.js";

const CACHE_DIR = ".assertive";
const CACHE_FILE = "sync-cache.json";
type Cache = Record<string, string>;

function getCachePath() {
  return path.join(findProjectRoot(), CACHE_DIR, CACHE_FILE);
}

export function readCache(): Cache {
  const cachePath = getCachePath();
  if (!fs.existsSync(cachePath)) {
    return {};
  }

  return JSON.parse(fs.readFileSync(cachePath, "utf8"));
}

export function writeCache(cache: Cache) {
  const cachePath = getCachePath();
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });

  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
}

export function hashFile(file: string) {
  const content = fs.readFileSync(file, "utf8");

  return crypto.createHash("sha256").update(content).digest("hex");
}
