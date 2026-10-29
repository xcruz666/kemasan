"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { cleanupUploads } from "@/lib/content/cleanup";
import { readSettings, saveSeoSettings, saveSiteIdentity } from "@/lib/content/settings";
import {
  settingsUploads,
  validateSeoSettings,
  validateSiteIdentity,
} from "@/lib/content/settings-shared";
import {
  type FormState,
  INVALID_FORM,
  SAVE_ERROR,
  failure,
  fieldFailure,
  parsePayload,
  success,
} from "./form-state";

export async function saveSiteIdentityAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const raw = parsePayload(formData.get("payload"));
  if (raw === undefined) return failure(INVALID_FORM);

  const validated = validateSiteIdentity(raw);
  if (!validated.ok) return fieldFailure(validated.errors);

  try {
    await saveSiteIdentity(validated.value);
  } catch (error) {
    console.error("[admin] Gagal menyimpan pengaturan situs:", error);
    return failure(SAVE_ERROR);
  }

  // Announcement bar, header, footer, and the site name appear on every public page.
  revalidatePath("/", "layout");
  return success("Pengaturan situs berhasil disimpan.");
}

export async function saveSeoSettingsAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const raw = parsePayload(formData.get("payload"));
  if (raw === undefined) return failure(INVALID_FORM);

  const validated = validateSeoSettings(raw);
  if (!validated.ok) return fieldFailure(validated.errors);

  let replaced: string[];
  try {
    const previous = await readSettings();
    await saveSeoSettings(validated.value);
    const kept = new Set(settingsUploads(validated.value));
    replaced = settingsUploads(previous.seo).filter((file) => !kept.has(file));
  } catch (error) {
    console.error("[admin] Gagal menyimpan pengaturan SEO:", error);
    return failure(SAVE_ERROR);
  }

  await cleanupUploads(replaced);
  // Titles, favicon, and canonical URLs are in every page's <head>; the domain is in the sitemap.
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  revalidatePath("/robots.txt");
  return success("Pengaturan SEO berhasil disimpan.");
}
