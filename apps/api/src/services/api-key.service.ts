import crypto from "node:crypto";
import { apiKeyRepository } from "../repositories/api-key.repository";

export const apiKeyService = {
  async create(projectId: string, name: string) {
    const rawKey = "ask_live_" + crypto.randomBytes(24).toString("hex");

    const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");
    const apiKey = await apiKeyRepository.create({
      name,
      hashedKey,
      projectId,
    });

    return { apiKey, rawKey };
  },
};
