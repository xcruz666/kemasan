import type { FieldErrors } from "@/lib/content/types";

/**
 * Shared by the admin Server Actions and the client forms. Lives outside the
 * "use server" files because those may only export async functions.
 */
export type FormState = {
  status: "idle" | "success" | "error";
  message: string;
  errors: FieldErrors;
};

export const initialFormState: FormState = { status: "idle", message: "", errors: {} };

export type UploadResult = { ok: true; file: string } | { ok: false; error: string };

export const SAVE_ERROR = "Gagal menyimpan. Folder data di server tidak dapat ditulis.";
export const INVALID_FORM = "Data formulir tidak valid. Muat ulang halaman lalu coba lagi.";
export const CHECK_FIELDS = "Periksa kembali isian yang ditandai.";

export function failure(message: string, errors: FieldErrors = {}): FormState {
  return { status: "error", message, errors };
}

export function success(message: string): FormState {
  return { status: "success", message, errors: {} };
}

/** Field errors from validation or storage; a "form" error becomes the top message. */
export function fieldFailure(errors: FieldErrors): FormState {
  return failure(errors.form ?? CHECK_FIELDS, errors);
}

const MAX_PAYLOAD_LENGTH = 200_000;

/** Returns undefined when the payload is missing or not valid JSON. */
export function parsePayload(value: FormDataEntryValue | null): unknown {
  if (typeof value !== "string" || value.length > MAX_PAYLOAD_LENGTH) return undefined;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
}

export function readId(formData: FormData): string | undefined {
  const value = formData.get("id");
  return typeof value === "string" && value ? value : undefined;
}
