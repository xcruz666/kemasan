import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keyLength: number,
  options: { N: number; r: number; p: number },
) => Promise<Buffer>;

const PARAMS = { N: 16384, r: 8, p: 1 };
const KEY_LENGTH = 64;

/**
 * Format: scrypt:N:r:p:salt:key. Uses ":" rather than "$" because Next.js
 * expands "$NAME" inside .env files.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEY_LENGTH, PARAMS);
  return [
    "scrypt",
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString("base64url"),
    key.toString("base64url"),
  ].join(":");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [algorithm, n, r, p, saltText, keyText] = stored.split(":");
    if (algorithm !== "scrypt" || !saltText || !keyText) return false;
    const params = { N: Number(n), r: Number(r), p: Number(p) };
    if (![params.N, params.r, params.p].every(Number.isInteger)) return false;
    const expected = Buffer.from(keyText, "base64url");
    if (expected.length === 0) return false;
    const actual = await scrypt(password, Buffer.from(saltText, "base64url"), expected.length, params);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
