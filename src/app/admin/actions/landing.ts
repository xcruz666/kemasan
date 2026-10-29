"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { cleanupUploads } from "@/lib/content/cleanup";
import { readLanding, saveLanding } from "@/lib/content/landing";
import { landingUploads, validateLanding } from "@/lib/content/landing-shared";
import {
  type FormState,
  INVALID_FORM,
  SAVE_ERROR,
  failure,
  fieldFailure,
  parsePayload,
  success,
} from "./form-state";

export async function saveLandingAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const raw = parsePayload(formData.get("payload"));
  if (raw === undefined) return failure(INVALID_FORM);

  const validated = validateLanding(raw);
  if (!validated.ok) return fieldFailure(validated.errors);

  let replaced: string[];
  try {
    const previous = await readLanding();
    await saveLanding(validated.value);
    const kept = new Set(landingUploads(validated.value));
    replaced = landingUploads(previous).filter((file) => !kept.has(file));
  } catch (error) {
    console.error("[admin] Gagal menyimpan halaman utama:", error);
    return failure(SAVE_ERROR);
  }

  await cleanupUploads(replaced);
  // The landing page is the site root.
  revalidatePath("/", "layout");
  return success("Halaman utama berhasil disimpan.");
}
