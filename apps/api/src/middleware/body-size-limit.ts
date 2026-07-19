import { createMiddleware } from "hono/factory";
import type { HonoVariables } from "../types/hono";
import { AppError } from "../lib/app-error";
import { ERROR_CODES } from "@assertive/shared";

const DEFAULT_JSON_LIMIT = 1024 * 1024; // 1MB
const TRACE_UPLOAD_LIMIT = 100 * 1024 * 1024; // 100MB

export const bodySizeLimit = createMiddleware<{
  Variables: HonoVariables;
}>(async (c, next) => {
  const contentType = c.req.header("content-type") ?? "";
  const contentLength = c.req.header("content-length");

  if (contentType.includes("multipart/form-data")) {
    if (contentLength && Number(contentLength) > TRACE_UPLOAD_LIMIT) {
      throw new AppError(
        ERROR_CODES.PAYLOAD_TOO_LARGE,
        `Request body exceeds limit of ${TRACE_UPLOAD_LIMIT} bytes`,
        413,
      );
    }

    await next();

    return;
  }

  if (contentLength && Number(contentLength) > DEFAULT_JSON_LIMIT) {
    throw new AppError(
      ERROR_CODES.PAYLOAD_TOO_LARGE,
      `Request body exceeds limit of ${DEFAULT_JSON_LIMIT} bytes`,
      413,
    );
  }

  await next();
});
