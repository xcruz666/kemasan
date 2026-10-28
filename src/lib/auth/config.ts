export type AuthConfig = { passwordHash: string; sessionSecret: string };

/** null means the admin is not configured; the public site keeps working. */
export function getAuthConfig(): AuthConfig | null {
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const sessionSecret = process.env.SESSION_SECRET?.trim();
  if (!passwordHash?.startsWith("scrypt:") || !sessionSecret || sessionSecret.length < 32) {
    return null;
  }
  return { passwordHash, sessionSecret };
}
