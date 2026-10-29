"use client";

import { type ChangeEvent, type Dispatch, type ReactNode, type SetStateAction, useState } from "react";
import { ImagePlus, RotateCcw } from "lucide-react";
import { uploadUrl } from "@/lib/content/image-ref";
import type { ImageRef } from "@/lib/content/types";
import { FieldError } from "./form-parts";
import { ACCEPTED_IMAGE_TYPES, uploadImageFile } from "./upload-image";

/**
 * One optional image with a built-in fallback, for link previews and the
 * favicon. Unlike SingleImageField, empty means "use the default" and the
 * default is shown, and alt text is optional (passed in as children).
 */
export function SeoImageField({
  id,
  label,
  help,
  image,
  onChange,
  fallbackUrl,
  resetLabel,
  shape,
  warning,
  error,
  children,
}: {
  id: string;
  label: string;
  help: string;
  image: ImageRef | null;
  onChange: Dispatch<SetStateAction<ImageRef | null>>;
  /** Shown while no image is uploaded. */
  fallbackUrl: string;
  /** e.g. "Pakai gambar bawaan". */
  resetLabel: string;
  shape: "wide" | "square";
  /** Client-side hint about the uploaded image, e.g. not square. */
  warning?: string | null;
  error?: string;
  children?: ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    setUploadError(null);
    const result = await uploadImageFile(file);
    setBusy(false);
    if (result.ok) onChange((current) => ({ ...result.image, alt: current?.alt ?? "" }));
    else setUploadError(result.error);
  }

  return (
    <fieldset className="admin-field admin-fieldset" aria-describedby={`${id}-help`}>
      <legend className="admin-label">{label}</legend>
      <p className="admin-help" id={`${id}-help`}>
        {help}
      </p>
      <div className={`admin-gallery-item seo-image seo-image-${shape}`}>
        <div className="admin-gallery-thumb seo-image-thumb">
          <img
            src={image ? uploadUrl(image.file) : fallbackUrl}
            alt=""
            width={image?.width}
            height={image?.height}
          />
          {!image && <span className="admin-badge admin-badge-draft">Bawaan</span>}
        </div>
        <div className="admin-gallery-meta">
          <p className="admin-help">
            {image ? `Gambar upload, ${image.width} × ${image.height} px.` : "Memakai bawaan situs."}
          </p>
          {warning && <p className="admin-warning-text">{warning}</p>}
          {children}
          <div className="admin-gallery-actions">
            <label className={busy ? "admin-upload admin-upload-disabled" : "admin-upload"}>
              <ImagePlus size={18} aria-hidden="true" />
              <span>{busy ? "Mengunggah…" : image ? "Ganti gambar" : "Pilih gambar"}</span>
              <input
                id={id}
                className="admin-visually-hidden"
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                disabled={busy}
                onChange={upload}
              />
            </label>
            {image && (
              <button
                type="button"
                className="admin-button admin-button-secondary seo-image-reset"
                onClick={() => onChange(null)}
              >
                <RotateCcw size={16} aria-hidden="true" /> {resetLabel}
              </button>
            )}
          </div>
        </div>
      </div>
      <div aria-live="polite">
        {uploadError && <p className="admin-error">{uploadError}</p>}
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </fieldset>
  );
}
