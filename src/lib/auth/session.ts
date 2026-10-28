import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "optima_admin";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Token: <expiresAtMs>.<hmac>. Stateless; rotating SESSION_SECRET ends every session. */
export function createSessionToken(secret: string, now = Date.now()): string {
  const expiresAt = String(now + SESSION_MAX_AGE_SECONDS * 1000);
  return `${expiresAt}.${sign(expiresAt, secret)}`;
}

export function verifySessionToken(
  token: string | undefined,
  secret: string,
  now = Date.now(),
): boolean {
  if (!token) return false;
  const [expiresAt, signature, extra] = token.split(".");
  if (!expiresAt || !signature || extra !== undefined || !/^\d+$/.test(expiresAt)) return false;
  const expected = Buffer.from(sign(expiresAt, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false;
  return Number(expiresAt) > now;
}
