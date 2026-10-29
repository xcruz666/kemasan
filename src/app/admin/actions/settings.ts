"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { saveHeaderMenu, saveWhatsappSettings } from "@/lib/content/settings";
import { validateHeaderMenu, validateWhatsappInput } from "@/lib/content/settings-shared";
import {
  type FormState,
  INVALID_FORM,
  SAVE_ERROR,
  failure,
  fieldFailure,
  parsePayload,
  success,
} from "./form-state";

function readText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function saveWhatsappAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const validated = validateWhatsappInput({
    phone: readText(formData, "phone"),
    defaultMessage: readText(formData, "defaultMessage"),
  });
  if (!validated.ok) return fieldFailure(validated.errors);

  try {
    await saveWhatsappSettings(validated.value);
  } catch (error) {
    console.error("[admin] Gagal menyimpan pengaturan WhatsApp:", error);
    return failure(SAVE_ERROR);
  }

  // The number and message appear on every public page.
  revalidatePath("/", "layout");
  return success("Pengaturan WhatsApp berhasil disimpan.");
}

export async function saveHeaderMenuAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const raw = parsePayload(formData.get("payload"));
  if (raw === undefined) return failure(INVALID_FORM);

  const validated = validateHeaderMenu(raw);
  if (!validated.ok) return fieldFailure(validated.errors);

  try {
    await saveHeaderMenu(validated.value);
  } catch (error) {
    console.error("[admin] Gagal menyimpan menu header:", error);
    return failure(SAVE_ERROR);
  }

  // The header is part of every public page; /admin/halaman shows "di menu" badges.
  revalidatePath("/", "layout");
  return success("Menu header berhasil disimpan.");
}
