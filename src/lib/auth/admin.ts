import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthConfig } from "./config";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifySessionToken,
} from "./session";

export async function isAdmin(): Promise<boolean> {
  const config = getAuthConfig();
  if (!config) return false;
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value, config.sessionSecret);
}

/** Call at the top of every admin page and every admin Server Action. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function startSession(sessionSecret: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(sessionSecret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
