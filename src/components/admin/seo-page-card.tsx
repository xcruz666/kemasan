"use client";

import type { Dispatch, SetStateAction } from "react";
import { uploadUrl } from "@/lib/content/image-ref";
import {
  OG_DESCRIPTION_MAX,
  SEO_DESCRIPTION_MAX,
  SEO_TITLE_MAX,
  URL_MAX,
  type PageSeo,
} from "@/lib/content/settings-shared";
import type { FieldErrors, ImageRef } from "@/lib/content/types";
import { Counter, FieldError } from "./form-parts";
import { SeoImageField } from "./seo-image-field";

const ALT_MAX = 160;

export const CANONICAL_WARNING =
  "Isi hanya kalau halaman ini memang salinan dari URL lain. URL yang salah bisa membuat halaman ini hilang dari Google.";

/** Same rule as fullTitle in @/lib/seo, which runs on the server. */
export function titleWithSiteName(title: string, siteName: string, appendSiteName: boolean) {
  return appendSiteName && title !== siteName ? `${title} | ${siteName}` : title;
}

/** Roughly how WhatsApp and Telegram show a shared link: site name, title, description, image. */
export function LinkPreview({
  siteName,
  title,
  description,
  imageUrl,
}: {
  siteName: string;
  title: string;
  description: string;
  imageUrl: string;
}) {
  return (
    <figure className="seo-preview">
      <figcaption className="admin-label">Pratinjau saat link dibagikan</figcaption>
      <div className="seo-preview-card">
        <div className="seo-preview-text">
          <span className="seo-preview-site">{siteName}</span>
          <span className="seo-preview-title">{title}</span>
          <span className="seo-preview-description">{description}</span>
        </div>
        <img className="seo-preview-image" src={imageUrl} alt="" />
      </div>
      <p className="admin-help">
        WhatsApp dan Telegram menyimpan cache pratinjau; link yang pernah dibagikan bisa tetap
        menampilkan versi lama. Di Telegram, kirim link ke @WebpageBot untuk memperbarui.
      </p>
    </figure>
  );
}

export function PageSeoCard({
  pageKey,
  heading,
  path,
  page,
  onChange,
  onImageChange,
  errors,
  siteName,
  appendSiteName,
  defaultDescription,
  defaultImageUrl,
}: {
  pageKey: "home" | "katalog";
  heading: string;
  /** Public path, e.g. /katalog. */
  path: string;
  page: PageSeo;
  onChange: (patch: Partial<PageSeo>) => void;
  onImageChange: Dispatch<SetStateAction<ImageRef | null>>;
  errors: FieldErrors;
  siteName: string;
  appendSiteName: boolean;
  defaultDescription: string;
  /** Preview image when the page has none of its own. */
  defaultImageUrl: string;
}) {
  const id = `seo-${pageKey}`;
  const error = (field: string) => errors[`pages.${pageKey}.${field}`];
  const describedBy = (field: string, help = true) =>
    [help ? `${id}-${field}-help` : "", error(field) ? `${id}-${field}-error` : ""]
      .filter(Boolean)
      .join(" ") || undefined;

  const fullTitle = titleWithSiteName(page.title.trim(), siteName, appendSiteName);
  const description = page.description.trim() || defaultDescription;

  return (
    <section className="admin-card admin-section">
      <div>
        <h2 className="admin-section-title">{heading}</h2>
        <p className="admin-help">
          Halaman <span className="admin-mono">{path}</span>
        </p>
      </div>

      <div className="admin-field">
        <div className="admin-label-row">
          <label className="admin-label" htmlFor={`${id}-title`}>
            Judul
          </label>
          <Counter value={page.title} max={SEO_TITLE_MAX} />
        </div>
        <input
          id={`${id}-title`}
          className="admin-input"
          value={page.title}
          onChange={(event) => onChange({ title: event.target.value })}
          required
          aria-invalid={Boolean(error("title"))}
          aria-describedby={describedBy("title")}
        />
        <p className="admin-help" id={`${id}-title-help`}>
          Di tab browser dan hasil Google tampil sebagai: <strong>{fullTitle}</strong>
        </p>
        <FieldError id={`${id}-title-error`} message={error("title")} />
      </div>

      <div className="admin-field">
        <div className="admin-label-row">
          <label className="admin-label" htmlFor={`${id}-description`}>
            Deskripsi
          </label>
          <Counter value={page.description} max={SEO_DESCRIPTION_MAX} />
        </div>
        <textarea
          id={`${id}-description`}
          className="admin-input admin-textarea"
          value={page.description}
          onChange={(event) => onChange({ description: event.target.value })}
          rows={3}
          required
          aria-invalid={Boolean(error("description"))}
          aria-describedby={describedBy("description", false)}
        />
        <FieldError id={`${id}-description-error`} message={error("description")} />
      </div>

      <div className="admin-field-row">
        <div className="admin-field">
          <div className="admin-label-row">
            <label className="admin-label" htmlFor={`${id}-ogTitle`}>
              Judul preview (opsional)
            </label>
            <Counter value={page.ogTitle} max={SEO_TITLE_MAX} />
          </div>
          <input
            id={`${id}-ogTitle`}
            className="admin-input"
            value={page.ogTitle}
            onChange={(event) => onChange({ ogTitle: event.target.value })}
            placeholder={fullTitle}
            aria-invalid={Boolean(error("ogTitle"))}
            aria-describedby={describedBy("ogTitle")}
          />
          <p className="admin-help" id={`${id}-ogTitle-help`}>
            Kosong = sama dengan judul.
          </p>
          <FieldError id={`${id}-ogTitle-error`} message={error("ogTitle")} />
        </div>
        <div className="admin-field">
          <div className="admin-label-row">
            <label className="admin-label" htmlFor={`${id}-ogDescription`}>
              Deskripsi preview (opsional)
            </label>
            <Counter value={page.ogDescription} max={OG_DESCRIPTION_MAX} />
          </div>
          <textarea
            id={`${id}-ogDescription`}
            className="admin-input admin-textarea"
            value={page.ogDescription}
            onChange={(event) => onChange({ ogDescription: event.target.value })}
            rows={3}
            placeholder={description}
            aria-invalid={Boolean(error("ogDescription"))}
            aria-describedby={describedBy("ogDescription")}
          />
          <p className="admin-help" id={`${id}-ogDescription-help`}>
            Kosong = sama dengan deskripsi.
          </p>
          <FieldError id={`${id}-ogDescription-error`} message={error("ogDescription")} />
        </div>
      </div>

      <SeoImageField
        id={`${id}-ogImage`}
        label="Gambar preview (opsional)"
        help="Kosong = gambar preview bawaan. Disarankan 1200 × 630 px."
        image={page.ogImage}
        onChange={onImageChange}
        fallbackUrl={defaultImageUrl}
        resetLabel="Pakai gambar bawaan"
        shape="wide"
        warning={smallPreviewWarning(page.ogImage)}
        error={error("ogImage")}
      >
        {page.ogImage && (
          <>
            <label className="admin-label-small" htmlFor={`${id}-ogImage-alt`}>
              Teks alt (opsional)
            </label>
            <input
              id={`${id}-ogImage-alt`}
              className="admin-input"
              value={page.ogImage.alt}
              onChange={(event) => {
                const alt = event.target.value;
                onImageChange((current) => (current ? { ...current, alt } : current));
              }}
              maxLength={ALT_MAX}
              placeholder="Kosong = judul halaman"
            />
          </>
        )}
      </SeoImageField>

      <div className="admin-field">
        <label className="admin-label" htmlFor={`${id}-canonical`}>
          Canonical URL (opsional)
        </label>
        <input
          id={`${id}-canonical`}
          className="admin-input"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          value={page.canonical}
          onChange={(event) => onChange({ canonical: event.target.value })}
          maxLength={URL_MAX}
          placeholder="Kosong = alamat halaman ini"
          aria-invalid={Boolean(error("canonical"))}
          aria-describedby={describedBy("canonical")}
        />
        <p className="admin-help" id={`${id}-canonical-help`}>
          Kosongkan agar memakai alamat halaman ini.{" "}
          <span className="admin-warning-text">{CANONICAL_WARNING}</span>
        </p>
        <FieldError id={`${id}-canonical-error`} message={error("canonical")} />
      </div>

      <LinkPreview
        siteName={siteName}
        title={page.ogTitle.trim() || fullTitle}
        description={page.ogDescription.trim() || description}
        imageUrl={page.ogImage ? uploadUrl(page.ogImage.file) : defaultImageUrl}
      />
    </section>
  );
}

/** Link previews generally want at least 600 px wide; smaller images often show as a small thumbnail. */
export function smallPreviewWarning(image: ImageRef | null): string | null {
  if (!image || image.width >= 600) return null;
  return `Gambar ini hanya ${image.width} px lebarnya. WhatsApp bisa menampilkannya sebagai thumbnail kecil; gunakan minimal 600 px, idealnya 1200 × 630 px.`;
}
