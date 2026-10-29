"use client";

import { type ChangeEvent, useContext, useState } from "react";
import { ImagePlus, RotateCcw } from "lucide-react";
import { uploadUrl } from "@/lib/content/image-ref";
import type { ImageRef } from "@/lib/content/types";
import { FieldError } from "./form-parts";
import { LandingErrors, TextField, fieldId } from "./landing-fields";
import { ACCEPTED_IMAGE_TYPES, uploadImageFile } from "./upload-image";

/**
 * Landing photo: null means the built-in photo from /public/images. Unlike
 * SingleImageField, the alt text lives beside the image (imageAlt) because it
 * also describes the built-in photo, so it stays editable either way.
 */
export function LandingImageField({
  path,
  label,
  image,
  alt,
  defaultSrc,
  onImage,
  onAlt,
}: {
  /** e.g. "hero"; the content fields are `${path}.image` and `${path}.imageAlt`. */
  path: string;
  label: string;
  image: ImageRef | null;
  alt: string;
  defaultSrc: string;
  onImage: (image: ImageRef | null) => void;
  onAlt: (alt: string) => void;
}) {
  const errors = useContext(LandingErrors);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const id = fieldId(`${path}.image`);

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    setUploadError(null);
    const result = await uploadImageFile(file);
    setBusy(false);
    if (result.ok) onImage({ ...result.image, alt });
    else setUploadError(result.error);
  }

  return (
    <fieldset className="admin-field admin-fieldset" aria-describedby={`${id}-help`}>
      <legend className="admin-label">{label}</legend>
      <div className="admin-gallery-item">
        <div className="admin-gallery-thumb">
          <img
            src={image ? uploadUrl(image.file) : defaultSrc}
            alt=""
            width={image?.width}
            height={image?.height}
          />
          {!image && <span className="admin-badge admin-badge-draft">Foto bawaan</span>}
        </div>
        <div className="admin-gallery-meta">
          <TextField
            path={`${path}.imageAlt`}
            label="Teks alt"
            value={alt}
            onChange={onAlt}
            placeholder="Jelaskan isi foto, contoh: kantong vacuum berisi daging sapi"
          />
          <div className="admin-gallery-actions">
            <label className={busy ? "admin-upload admin-upload-disabled" : "admin-upload"}>
              <ImagePlus size={18} aria-hidden="true" />
              <span>{busy ? "Mengunggah…" : "Ganti foto"}</span>
              <input
                id={id}
                className="admin-visually-hidden"
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                disabled={busy}
                onChange={onFile}
              />
            </label>
            {image && (
              <button
                type="button"
                className="admin-button admin-button-secondary admin-button-small"
                onClick={() => onImage(null)}
              >
                <RotateCcw size={16} aria-hidden="true" /> Pakai foto bawaan
              </button>
            )}
          </div>
        </div>
      </div>
      <p className="admin-help" id={`${id}-help`}>
        JPG, PNG, atau WebP, maksimal 3 MB. Foto dipotong mengikuti bingkai desain, jadi
        letakkan objek utama di tengah.
      </p>
      <div aria-live="polite">
        {uploadError && <p className="admin-error">{uploadError}</p>}
      </div>
      <FieldError id={`${id}-error`} message={errors[`${path}.image`]} />
    </fieldset>
  );
}
