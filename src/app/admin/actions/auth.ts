"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { endSession, requireAdmin, startSession } from "@/lib/auth/admin";
import { getAuthConfig } from "@/lib/auth/config";
import { verifyPassword } from "@/lib/auth/password";
import { createRateLimiter } from "@/lib/auth/rate-limit";
import { type FormState, failure } from "./form-state";

const limiter = createRateLimiter({ maxFailures: 5, windowMs: 15 * 60 * 1000 });

const TOO_MANY = "Terlalu banyak percobaan. Coba lagi dalam 15 menit.";
const MAX_PASSWORD_LENGTH = 1024;

async function clientKey(): Promise<string> {
  const store = await headers();
  const forwarded = store.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || store.get("x-real-ip")?.trim() || "unknown";
}

export async function login(_previous: FormState, formData: FormData): Promise<FormState> {
  const config = getAuthConfig();
  if (!config) {
    return failure(
      "Admin belum dikonfigurasi. Isi ADMIN_PASSWORD_HASH dan SESSION_SECRET di environment aplikasi.",
    );
  }

  const key = await clientKey();
  if (limiter.isBlocked(key)) return failure(TOO_MANY);

  const password = formData.get("password");
  const valid =
    typeof password === "string" &&
    password.length > 0 &&
    password.length <= MAX_PASSWORD_LENGTH &&
    (await verifyPassword(password, config.passwordHash));

  if (!valid) {
    limiter.recordFailure(key);
    return failure(limiter.isBlocked(key) ? TOO_MANY : "Password salah.");
  }

  limiter.reset(key);
  await startSession(config.sessionSecret);
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await requireAdmin();
  await endSession();
  redirect("/admin/login");
}
