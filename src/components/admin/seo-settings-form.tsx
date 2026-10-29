"use client";

import { type Dispatch, type SetStateAction, useActionState, useState } from "react";
import { initialFormState } from "@/app/admin/actions/form-state";
import { saveSeoSettingsAction } from "@/app/admin/actions/site";
import { uploadUrl } from "@/lib/content/image-ref";
import {
  DEFAULT_OG_IMAGE,
  SEO_DESCRIPTION_MAX,
  URL_MAX,
  type PageSeo,
  type SeoSettings,
} from "@/lib/content/settings-shared";
import type { ImageRef } from "@/lib/content/types";
import { Counter, FieldError, submitWithoutReset } from "./form-parts";
import { PageSeoCard, smallPreviewWarning } from "./seo-page-card";
import { SeoImageField } from "./seo-image-field";
import { CardMessage } from "./whatsapp-settings-form";

const ALT_MAX = 160;
const FAVICON_MIN = 48;

type PageKey = keyof SeoSettings["pages"];

function faviconWarning(image: ImageRef | null): string | null {
  if (!image) return null;
  if (image.width !== image.height) {
    return `Ikon sebaiknya persegi. Gambar ini ${image.width} × ${image.height} px dan bisa terlihat gepeng atau terpotong.`;
  }
  if (image.width < FAVICON_MIN) {
    return `Ikon lebih kecil dari ${FAVICON_MIN} px dan bisa terlihat buram. Gunakan minimal ${FAVICON_MIN} × ${FAVICON_MIN} px, idealnya 512 × 512 px.`;
  }
  return null;
}

export function SeoSettingsForm({
  seo: initial,
  siteName,
  siteUrl,
}: {
  seo: SeoSettings;
  /** Saved site name, for titles and the link preview. */
  siteName: string;
  /** SITE_URL from the server environment, used when the canonical domain is empty. */
  siteUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState(saveSeoSettingsAction, initialFormState);
  const [seo, setSeo] = useState<SeoSettings>(initial);
  const errors = state.errors;

  const set = (patch: Partial<SeoSettings>) => setSeo((current) => ({ ...current, ...patch }));
  const setPage = (key: PageKey, patch: Partial<PageSeo>) =>
    setSeo((current) => ({
      ...current,
      pages: { ...current.pages, [key]: { ...current.pages[key], ...patch } },
    }));

  /** Adapts SeoImageField's setState-style callback to one image inside the settings. */
  function imageSetter(
    read: (current: SeoSettings) => ImageRef | null,
    write: (current: SeoSettings, image: ImageRef | null) => SeoSettings,
  ): Dispatch<SetStateAction<ImageRef | null>> {
    return (action) =>
      setSeo((current) =>
        write(current, typeof action === "function" ? action(read(current)) : action),
      );
  }
  const pageImageSetter = (key: PageKey) =>
    imageSetter(
      (current) => current.pages[key].ogImage,
      (current, ogImage) => ({
        ...current,
        pages: { ...current.pages, [key]: { ...current.pages[key], ogImage } },
      }),
    );

  const defaultImageUrl = seo.defaultOgImage
    ? uploadUrl(seo.defaultOgImage.file)
    : DEFAULT_OG_IMAGE.url;

  // The default image has one alt text field for both the built-in and an uploaded image.
  const payload = JSON.stringify({
    ...seo,
    defaultOgImage: seo.defaultOgImage && { ...seo.defaultOgImage, alt: seo.defaultOgImageAlt },
  });

  const describedBy = (field: string) =>
    [`seo-${field}-help`, errors[field] ? `seo-${field}-error` : ""].filter(Boolean).join(" ");

  return (
    <form className="admin-form" onSubmit={submitWithoutReset(formAction)}>
      <input type="hidden" name="payload" value={payload} />

      <section className="admin-card admin-section">
        <div>
          <h2 className="admin-section-title">SEO</h2>
          <p className="admin-help">
            Bawaan untuk semua halaman. Produk dan halaman lain mengatur judul dan deskripsinya
            sendiri di formnya.
          </p>
        </div>

        <div className="admin-field">
          <label className="admin-check">
            <input
              type="checkbox"
              checked={seo.appendSiteName}
              onChange={(event) => set({ appendSiteName: event.target.checked })}
              aria-describedby="seo-appendSiteName-help"
            />
            <span>Tambahkan nama situs di akhir judul halaman</span>
          </label>
          <p className="admin-help" id="seo-appendSiteName-help">
            Contoh: {seo.pages.katalog.title || "Katalog"}
            {seo.appendSiteName && ` | ${siteName}`}
          </p>
        </div>

        <div className="admin-field">
          <div className="admin-label-row">
            <label className="admin-label" htmlFor="seo-defaultDescription">
              Deskripsi bawaan
            </label>
            <Counter value={seo.defaultDescription} max={SEO_DESCRIPTION_MAX} />
          </div>
          <textarea
            id="seo-defaultDescription"
            className="admin-input admin-textarea"
            value={seo.defaultDescription}
            onChange={(event) => set({ defaultDescription: event.target.value })}
            rows={3}
            required
            aria-invalid={Boolean(errors.defaultDescription)}
            aria-describedby={describedBy("defaultDescription")}
          />
          <p className="admin-help" id="seo-defaultDescription-help">
            Dipakai halaman yang tidak punya deskripsi sendiri.
          </p>
          <FieldError id="seo-defaultDescription-error" message={errors.defaultDescription} />
        </div>

        <SeoImageField
          id="seo-defaultOgImage"
          label="Gambar preview bawaan"
          help="Tampil saat link dibagikan, untuk halaman tanpa gambar sendiri. Disarankan 1200 × 630 px (rasio 1,91:1)."
          image={seo.defaultOgImage}
          onChange={imageSetter(
            (current) => current.defaultOgImage,
            (current, defaultOgImage) => ({ ...current, defaultOgImage }),
          )}
          fallbackUrl={DEFAULT_OG_IMAGE.url}
          resetLabel="Pakai gambar bawaan"
          shape="wide"
          warning={smallPreviewWarning(seo.defaultOgImage)}
          error={errors.defaultOgImage}
        >
          <label className="admin-label-small" htmlFor="seo-defaultOgImageAlt">
            Teks alt
          </label>
          <input
            id="seo-defaultOgImageAlt"
            className="admin-input"
            value={seo.defaultOgImageAlt}
            onChange={(event) => set({ defaultOgImageAlt: event.target.value })}
            maxLength={ALT_MAX}
            placeholder={DEFAULT_OG_IMAGE.alt}
            aria-invalid={Boolean(errors.defaultOgImageAlt)}
          />
          <FieldError id="seo-defaultOgImageAlt-error" message={errors.defaultOgImageAlt} />
        </SeoImageField>

        <SeoImageField
          id="seo-favicon"
          label="Favicon"
          help="Ikon di tab browser dan saat situs disimpan ke layar utama HP. Gunakan gambar persegi, minimal 48 × 48 px, idealnya 512 × 512 px."
          image={seo.favicon}
          onChange={imageSetter(
            (current) => current.favicon,
            (current, favicon) => ({ ...current, favicon }),
          )}
          fallbackUrl="/icon.svg"
          resetLabel="Pakai ikon bawaan"
          shape="square"
          warning={faviconWarning(seo.favicon)}
          error={errors.favicon}
        />

        <div className="admin-field">
          <label className="admin-label" htmlFor="seo-canonicalOrigin">
            Domain canonical
          </label>
          <input
            id="seo-canonicalOrigin"
            className="admin-input"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            value={seo.canonicalOrigin}
            onChange={(event) => set({ canonicalOrigin: event.target.value })}
            maxLength={URL_MAX}
            placeholder={siteUrl ?? "https://optimakemasanprima.com"}
            aria-invalid={Boolean(errors.canonicalOrigin)}
            aria-describedby={[describedBy("canonicalOrigin"), "seo-canonicalOrigin-warning"].join(" ")}
          />
          <p className="admin-help" id="seo-canonicalOrigin-help">
            Domain utama untuk canonical URL, sitemap, dan preview link. Kosongkan untuk memakai
            SITE_URL dari server
            {siteUrl ? (
              <>
                {" "}
                (<span className="admin-mono">{siteUrl}</span>).
              </>
            ) : (
              ", yang saat ini belum diatur."
            )}
          </p>
          <p
            className="admin-banner admin-banner-warning admin-banner-flush"
            id="seo-canonicalOrigin-warning"
          >
            Harus sama persis dengan domain tempat situs benar-benar dibuka, termasuk https:// dan
            ada/tidaknya www. Domain yang salah membuat Google mengindeks alamat yang keliru dan
            preview link bisa gagal. Atur juga redirect 301 di hosting agar alamat lain (http://,
            dengan/tanpa www) dialihkan ke domain ini.
          </p>
          <FieldError id="seo-canonicalOrigin-error" message={errors.canonicalOrigin} />
        </div>
      </section>

      <PageSeoCard
        pageKey="home"
        heading="SEO Beranda"
        path="/"
        page={seo.pages.home}
        onChange={(patch) => setPage("home", patch)}
        onImageChange={pageImageSetter("home")}
        errors={errors}
        siteName={siteName}
        appendSiteName={seo.appendSiteName}
        defaultDescription={seo.defaultDescription}
        defaultImageUrl={defaultImageUrl}
      />
      <PageSeoCard
        pageKey="katalog"
        heading="SEO Katalog"
        path="/katalog"
        page={seo.pages.katalog}
        onChange={(patch) => setPage("katalog", patch)}
        onImageChange={pageImageSetter("katalog")}
        errors={errors}
        siteName={siteName}
        appendSiteName={seo.appendSiteName}
        defaultDescription={seo.defaultDescription}
        defaultImageUrl={defaultImageUrl}
      />

      <div className="admin-form-footer">
        <div className="admin-card-footer-message seo-footer-message">
          <CardMessage state={state} />
        </div>
        <button type="submit" className="admin-button admin-button-primary" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
    </form>
  );
}
