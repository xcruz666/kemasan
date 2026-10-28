"use client";

import { type ChangeEvent, type Dispatch, type SetStateAction, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, X } from "lucide-react";
import { uploadUrl } from "@/lib/content/image-ref";
import type { ImageRef } from "@/lib/content/types";
import { FieldError } from "./form-parts";
import { ACCEPTED_IMAGE_TYPES, uploadImageFile } from "./upload-image";

const ALT_MAX = 160;
const ALT_PLACEHOLDER = "Jelaskan isi foto, contoh: kantong vacuum berisi daging sapi";

type UploadStatus = { busy: string | null; errors: string[] };

function UploadStatusText({ status }: { status: UploadStatus }) {
  return (
    <div aria-live="polite">
      {status.busy && <p className="admin-help">{status.busy}</p>}
      {status.errors.map((error, index) => (
        <p className="admin-error" key={index}>
          {error}
        </p>
      ))}
    </div>
  );
}

function FilePicker({
  id,
  label,
  multiple,
  disabled,
  onFiles,
}: {
  id: string;
  label: string;
  multiple?: boolean;
  disabled: boolean;
  onFiles: (files: File[]) => void;
}) {
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length > 0) onFiles(files);
  };
  return (
    <label className={disabled ? "admin-upload admin-upload-disabled" : "admin-upload"}>
      <ImagePlus size={18} aria-hidden="true" />
      <span>{label}</span>
      <input
        id={id}
        className="admin-visually-hidden"
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        multiple={multiple}
        disabled={disabled}
        onChange={onChange}
      />
    </label>
  );
}

export function ImageGalleryField({
  id,
  label,
  images,
  onChange,
  max = 10,
  error,
}: {
  id: string;
  label: string;
  images: ImageRef[];
  onChange: Dispatch<SetStateAction<ImageRef[]>>;
  max?: number;
  error?: string;
}) {
  const [status, setStatus] = useState<UploadStatus>({ busy: null, errors: [] });
  const remaining = max - images.length;

  async function upload(files: File[]) {
    const accepted = files.slice(0, remaining);
    const errors: string[] = [];
    if (files.length > remaining) errors.push(`Foto maksimal ${max}. Sebagian file tidak diunggah.`);
    for (const [index, file] of accepted.entries()) {
      setStatus({ busy: `Mengunggah foto ${index + 1} dari ${accepted.length}…`, errors: [...errors] });
      const result = await uploadImageFile(file);
      if (result.ok) onChange((current) => [...current, { ...result.image, alt: "" }]);
      else errors.push(`${file.name}: ${result.error}`);
    }
    setStatus({ busy: null, errors: [...errors] });
  }

  function update(index: number, alt: string) {
    onChange((current) => current.map((image, i) => (i === index ? { ...image, alt } : image)));
  }

  function move(index: number, offset: number) {
    onChange((current) => {
      const target = index + offset;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function remove(index: number) {
    onChange((current) => current.filter((_, i) => i !== index));
  }

  return (
    <fieldset className="admin-field admin-fieldset" aria-describedby={`${id}-help`}>
      <legend className="admin-label">{label}</legend>
      <p className="admin-help" id={`${id}-help`}>
        Maks {max} foto. Foto pertama menjadi foto utama. Teks alt wajib diisi untuk setiap foto.
      </p>
      {images.length > 0 && (
        <ol className="admin-gallery">
          {images.map((image, index) => (
            <li className="admin-gallery-item" key={image.file}>
              <div className="admin-gallery-thumb">
                <img src={uploadUrl(image.file)} alt="" width={image.width} height={image.height} />
                {index === 0 && <span className="admin-badge admin-badge-primary">Foto utama</span>}
              </div>
              <div className="admin-gallery-meta">
                <label className="admin-label-small" htmlFor={`${id}-alt-${index}`}>
                  Teks alt foto {index + 1}
                </label>
                <input
                  id={`${id}-alt-${index}`}
                  className="admin-input"
                  value={image.alt}
                  onChange={(event) => update(index, event.target.value)}
                  maxLength={ALT_MAX}
                  placeholder={ALT_PLACEHOLDER}
                  required
                  aria-invalid={Boolean(error) && !image.alt.trim()}
                />
                <div className="admin-gallery-actions">
                  <button
                    type="button"
                    className="admin-icon-button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Pindahkan foto ${index + 1} ke atas`}
                  >
                    <ArrowUp size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="admin-icon-button"
                    onClick={() => move(index, 1)}
                    disabled={index === images.length - 1}
                    aria-label={`Pindahkan foto ${index + 1} ke bawah`}
                  >
                    <ArrowDown size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="admin-icon-button admin-icon-button-danger"
                    onClick={() => remove(index)}
                    aria-label={`Hapus foto ${index + 1}`}
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
      <FilePicker
        id={id}
        label={status.busy ? "Mengunggah…" : "Tambah foto"}
        multiple
        disabled={Boolean(status.busy) || remaining <= 0}
        onFiles={upload}
      />
      <UploadStatusText status={status} />
      <FieldError id={`${id}-error`} message={error} />
    </fieldset>
  );
}

export function SingleImageField({
  id,
  label,
  image,
  onChange,
  error,
}: {
  id: string;
  label: string;
  image: ImageRef | null;
  onChange: Dispatch<SetStateAction<ImageRef | null>>;
  error?: string;
}) {
  const [status, setStatus] = useState<UploadStatus>({ busy: null, errors: [] });

  async function upload([file]: File[]) {
    setStatus({ busy: "Mengunggah foto…", errors: [] });
    const result = await uploadImageFile(file);
    if (result.ok) {
      onChange((current) => ({ ...result.image, alt: current?.alt ?? "" }));
      setStatus({ busy: null, errors: [] });
    } else {
      setStatus({ busy: null, errors: [result.error] });
    }
  }

  return (
    <fieldset className="admin-field admin-fieldset">
      <legend className="admin-label">{label}</legend>
      {image && (
        <div className="admin-gallery-item">
          <div className="admin-gallery-thumb">
            <img src={uploadUrl(image.file)} alt="" width={image.width} height={image.height} />
          </div>
          <div className="admin-gallery-meta">
            <label className="admin-label-small" htmlFor={`${id}-alt`}>
              Teks alt
            </label>
            <input
              id={`${id}-alt`}
              className="admin-input"
              value={image.alt}
              onChange={(event) => {
                const alt = event.target.value;
                onChange((current) => (current ? { ...current, alt } : current));
              }}
              maxLength={ALT_MAX}
              placeholder={ALT_PLACEHOLDER}
              required
              aria-invalid={Boolean(error) && !image.alt.trim()}
            />
            <div className="admin-gallery-actions">
              <button
                type="button"
                className="admin-button admin-button-secondary admin-button-small"
                onClick={() => onChange(null)}
              >
                <X size={16} aria-hidden="true" /> Hapus gambar
              </button>
            </div>
          </div>
        </div>
      )}
      <FilePicker
        id={id}
        label={status.busy ? "Mengunggah…" : image ? "Ganti gambar" : "Pilih gambar"}
        disabled={Boolean(status.busy)}
        onFiles={upload}
      />
      <UploadStatusText status={status} />
      <FieldError id={`${id}-error`} message={error} />
    </fieldset>
  );
}
