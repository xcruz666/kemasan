import { uploadImage } from "@/app/admin/actions/uploads";
import type { ImageRef } from "@/lib/content/types";
import { compressImage } from "./compress-image";

export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp";

/* Client copies of the server limits in src/lib/uploads.ts (server-only module). */
const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
export const UPLOAD_ERROR = "Format harus JPG, PNG, atau WebP, maksimal 3 MB.";

export type UploadedImage = Omit<ImageRef, "alt">;
export type ClientUploadResult = { ok: true; image: UploadedImage } | { ok: false; error: string };

/** Compress in the browser, then send one file to the upload Server Action. */
export async function uploadImageFile(file: File): Promise<ClientUploadResult> {
  if (!ACCEPTED_IMAGE_TYPES.split(",").includes(file.type)) {
    return { ok: false, error: UPLOAD_ERROR };
  }

  let compressed;
  try {
    compressed = await compressImage(file);
  } catch {
    return { ok: false, error: "Foto tidak dapat dibaca. Coba file lain." };
  }
  if (compressed.blob.size > MAX_UPLOAD_BYTES) return { ok: false, error: UPLOAD_ERROR };

  const extension = compressed.blob.type === "image/webp" ? "webp" : "jpg";
  const formData = new FormData();
  formData.append(
    "file",
    new File([compressed.blob], `foto.${extension}`, { type: compressed.blob.type }),
  );

  try {
    const result = await uploadImage(formData);
    if (!result.ok) return result;
    return {
      ok: true,
      image: { file: result.file, width: compressed.width, height: compressed.height },
    };
  } catch {
    return { ok: false, error: "Upload gagal. Periksa koneksi atau login ulang, lalu coba lagi." };
  }
}
