import * as crypto from "node:crypto";

export function hashAPIKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}
