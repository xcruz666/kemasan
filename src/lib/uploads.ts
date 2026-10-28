import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { dataPath } from "@/lib/content/data-dir";
import { UPLOAD_FILE_PATTERN } from "@/lib/content/image-ref";

export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
export const UPLOAD_ERROR = "Format harus JPG, PNG, atau WebP, maksimal 3 MB.";

export type ImageExtension = "jpg" | "png" | "webp";

export const CONTENT_TYPES: Record<ImageExtension, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function ascii(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.subarray(start, end));
}

/** Detect the real type from the first bytes; extension and Content-Type are not trusted. */
export function detectImageType(bytes: Uint8Array): ImageExtension | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpg";
  }
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length >= 8 && png.every((byte, index) => bytes[index] === byte)) return "png";
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP") {
    return "webp";
  }
  return null;
}

function uploadsDirectory() {
  return dataPath("uploads");
}

export type SaveUploadResult = { ok: true; file: string } | { ok: false; error: string };

export async function saveUpload(bytes: Uint8Array): Promise<SaveUploadResult> {
  if (bytes.length === 0 || bytes.length > MAX_UPLOAD_BYTES) {
    return { ok: false, error: UPLOAD_ERROR };
  }
  const extension = detectImageType(bytes);
  if (!extension) return { ok: false, error: UPLOAD_ERROR };

  const file = `${randomUUID()}.${extension}`;
  await mkdir(uploadsDirectory(), { recursive: true });
  await writeFile(path.join(uploadsDirectory(), file), bytes, { flag: "wx" });
  return { ok: true, file };
}

export async function readUpload(file: string): Promise<Buffer | null> {
  if (!UPLOAD_FILE_PATTERN.test(file)) return null;
  try {
    return await readFile(path.join(uploadsDirectory(), file));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function deleteUnusedUploads(candidates: string[], stillUsed: Set<string>) {
  for (const file of new Set(candidates)) {
    if (!UPLOAD_FILE_PATTERN.test(file) || stillUsed.has(file)) continue;
    await rm(path.join(uploadsDirectory(), file), { force: true });
  }
}
