"use server";

import { requireAdmin } from "@/lib/auth/admin";
import { MAX_UPLOAD_BYTES, UPLOAD_ERROR, saveUpload } from "@/lib/uploads";
import type { UploadResult } from "./form-state";

/** One image per call. The browser has already resized and re-encoded it. */
export async function uploadImage(formData: FormData): Promise<UploadResult> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: UPLOAD_ERROR };
  }

  try {
    return await saveUpload(new Uint8Array(await file.arrayBuffer()));
  } catch (error) {
    console.error("[admin] Gagal menyimpan foto:", error);
    return { ok: false, error: "Gagal mengunggah. Folder data di server tidak dapat ditulis." };
  }
}
