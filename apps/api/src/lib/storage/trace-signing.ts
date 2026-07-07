import crypto from "node:crypto";

const SECRET = process.env.TRACE_SIGNING_SECRET ?? "development-trace-secret";

const DEFAULT_EXPIRY_SECONDS = 60 * 10;

export function createSignedToken(
  traceKey: string,
  expiresIn = DEFAULT_EXPIRY_SECONDS,
) {
  const expires = Math.floor(Date.now() / 1000) + expiresIn;

  const payload = `${traceKey}:${expires}`;

  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex");

  return {
    expires,
    signature,
  };
}

export function verifySignedToken(
  traceKey: string,
  expires: number,
  signature: string,
) {
  if (expires < Math.floor(Date.now() / 1000)) {
    return false;
  }

  const payload = `${traceKey}:${expires}`;

  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex");

  if (signature.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
