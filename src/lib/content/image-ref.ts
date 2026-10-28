import type { ImageRef } from "./types";

/** Client-safe. Uploaded files are always named <uuid>.<ext> by the server. */
export const UPLOAD_FILE_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:jpg|png|webp)$/;

export const UPLOAD_URL_PATTERN = new RegExp(
  `^/uploads/${UPLOAD_FILE_PATTERN.source.slice(1)}`,
);

export function uploadUrl(file: string): string {
  return `/uploads/${file}`;
}

function isDimension(value: unknown) {
  return Number.isInteger(value) && (value as number) > 0 && (value as number) <= 10000;
}

export function isImageRef(value: unknown): value is ImageRef {
  if (!value || typeof value !== "object") return false;
  const image = value as Record<string, unknown>;
  return (
    typeof image.file === "string" &&
    UPLOAD_FILE_PATTERN.test(image.file) &&
    typeof image.alt === "string" &&
    isDimension(image.width) &&
    isDimension(image.height)
  );
}
