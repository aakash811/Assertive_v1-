import crypto from "node:crypto";
import { apiKeyRepository } from "../repositories/api-key.repository";
import { ApiScope } from "@assertive/shared";

export const apiKeyService = {
  async create(organizationId: string, name: string, scopes: ApiScope[]) {
    const rawKey = "ask_live_" + crypto.randomBytes(24).toString("hex");

    const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");
    const apiKey = await apiKeyRepository.create({
      name,
      hashedKey,
      organizationId,
      scopes,
    });

    return { apiKey, rawKey };
  },
};
