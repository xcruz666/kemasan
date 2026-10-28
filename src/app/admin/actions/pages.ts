"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { cleanupUploads } from "@/lib/content/cleanup";
import { deletePage, getPage, savePage } from "@/lib/content/pages";
import { pageUploads } from "@/lib/content/references";
import type { Page } from "@/lib/content/types";
import { validatePageInput } from "@/lib/content/validation";
import {
  type FormState,
  INVALID_FORM,
  SAVE_ERROR,
  failure,
  fieldFailure,
  parsePayload,
  readId,
  success,
} from "./form-state";

function revalidatePage(...pages: (Page | null)[]) {
  revalidatePath("/admin");
  revalidatePath("/admin/halaman");
  // Menu pages appear in the header of every public page.
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  for (const slug of new Set(pages.map((page) => page?.slug))) {
    if (slug) revalidatePath(`/${slug}`);
  }
}

export async function savePageAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const id = readId(formData);
  const raw = parsePayload(formData.get("payload"));
  if (raw === undefined) return failure(INVALID_FORM);

  const validated = validatePageInput(raw);
  if (!validated.ok) return fieldFailure(validated.errors);

  let previous: Page | null = null;
  let saved: Page;
  try {
    if (id) {
      previous = await getPage(id);
      if (!previous) return failure("Halaman tidak ditemukan. Mungkin sudah dihapus.");
    }
    const result = await savePage(validated.value, id);
    if (!result.ok) return fieldFailure(result.errors);
    saved = result.value;
  } catch (error) {
    console.error("[admin] Gagal menyimpan halaman:", error);
    return failure(SAVE_ERROR);
  }

  if (previous) await cleanupUploads(pageUploads(previous));
  revalidatePage(saved, previous);
  revalidatePath(`/admin/halaman/${saved.id}`);

  if (!id) redirect(`/admin/halaman/${saved.id}?disimpan=1`);
  return success("Halaman berhasil disimpan.");
}

export async function deletePageAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const id = readId(formData);
  if (!id) return failure(INVALID_FORM);

  let deleted: Page | null;
  try {
    deleted = await deletePage(id);
  } catch (error) {
    console.error("[admin] Gagal menghapus halaman:", error);
    return failure("Gagal menghapus. Folder data di server tidak dapat ditulis.");
  }
  if (!deleted) return failure("Halaman tidak ditemukan. Mungkin sudah dihapus.");

  await cleanupUploads(pageUploads(deleted));
  revalidatePage(deleted);
  redirect("/admin/halaman");
}
