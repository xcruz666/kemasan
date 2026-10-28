"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { savePageAction } from "@/app/admin/actions/pages";
import { initialFormState } from "@/app/admin/actions/form-state";
import { slugify } from "@/lib/content/slug";
import type { ImageRef, Page, Status } from "@/lib/content/types";
import { Counter, FieldError, FormMessage, submitWithoutReset } from "./form-parts";
import { SingleImageField } from "./image-field";
import { MarkdownEditor } from "./markdown-editor";

export function PageForm({ page, notice }: { page?: Page; notice?: string }) {
  const [state, formAction, pending] = useActionState(savePageAction, initialFormState);
  const errors = state.errors;

  const [title, setTitle] = useState(page?.title ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(page));
  const [body, setBody] = useState(page?.body ?? "");
  const [coverImage, setCoverImage] = useState<ImageRef | null>(page?.coverImage ?? null);
  const [showInMenu, setShowInMenu] = useState(page?.showInMenu ?? false);
  const [menuOrder, setMenuOrder] = useState(String(page?.menuOrder ?? 0));
  const [status, setStatus] = useState<Status>(page?.status ?? "draft");
  const [seoTitle, setSeoTitle] = useState(page?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(page?.seoDescription ?? "");

  const payload = JSON.stringify({
    title,
    slug,
    body,
    coverImage,
    showInMenu,
    menuOrder: menuOrder.trim() === "" ? 0 : Number(menuOrder),
    status,
    seoTitle,
    seoDescription,
  });

  function changeTitle(value: string) {
    setTitle(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  function changeSlug(value: string) {
    setSlug(value);
    setSlugEdited(value !== "");
  }

  const describedBy = (field: string) => (errors[field] ? `page-${field}-error` : undefined);

  return (
    <form className="admin-form" onSubmit={submitWithoutReset(formAction)}>
      <input type="hidden" name="payload" value={payload} />
      {page && <input type="hidden" name="id" value={page.id} />}

      <FormMessage state={state} notice={notice} />

      <section className="admin-card admin-section">
        <h2 className="admin-section-title">Isi halaman</h2>

        <div className="admin-field">
          <label className="admin-label" htmlFor="page-title">
            Judul
          </label>
          <input
            id="page-title"
            className="admin-input"
            value={title}
            onChange={(event) => changeTitle(event.target.value)}
            maxLength={120}
            required
            aria-invalid={Boolean(errors.title)}
            aria-describedby={describedBy("title")}
          />
          <FieldError id="page-title-error" message={errors.title} />
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="page-slug">
            Slug
          </label>
          <div className="admin-input-prefix">
            <span aria-hidden="true">/</span>
            <input
              id="page-slug"
              className="admin-input"
              value={slug}
              onChange={(event) => changeSlug(event.target.value)}
              maxLength={80}
              required
              aria-invalid={Boolean(errors.slug)}
              aria-describedby={["page-slug-help", describedBy("slug")].filter(Boolean).join(" ")}
            />
          </div>
          <p className="admin-help" id="page-slug-help">
            Huruf kecil, angka, dan tanda hubung. Terisi otomatis dari judul.
          </p>
          <FieldError id="page-slug-error" message={errors.slug} />
        </div>

        <MarkdownEditor
          id="page-body"
          label="Isi"
          value={body}
          onChange={setBody}
          error={errors.body}
        />
      </section>

      <section className="admin-card admin-section">
        <h2 className="admin-section-title">Gambar sampul</h2>
        <SingleImageField
          id="page-cover"
          label="Gambar sampul (opsional)"
          image={coverImage}
          onChange={setCoverImage}
          error={errors.coverImage}
        />
      </section>

      <section className="admin-card admin-section">
        <h2 className="admin-section-title">Tampilan</h2>
        <label className="admin-check">
          <input
            type="checkbox"
            checked={showInMenu}
            onChange={(event) => setShowInMenu(event.target.checked)}
          />
          <span>Tampil di menu header</span>
        </label>
        <div className="admin-field-row">
          <div className="admin-field">
            <label className="admin-label" htmlFor="page-status">
              Status
            </label>
            <select
              id="page-status"
              className="admin-input"
              value={status}
              onChange={(event) => setStatus(event.target.value as Status)}
              aria-invalid={Boolean(errors.status)}
            >
              <option value="draft">Draf</option>
              <option value="published">Terbit</option>
            </select>
            <FieldError id="page-status-error" message={errors.status} />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="page-menu-order">
              Urutan menu
            </label>
            <input
              id="page-menu-order"
              className="admin-input"
              type="number"
              step={1}
              value={menuOrder}
              onChange={(event) => setMenuOrder(event.target.value)}
              aria-invalid={Boolean(errors.menuOrder)}
              aria-describedby={describedBy("menuOrder")}
            />
            <FieldError id="page-menuOrder-error" message={errors.menuOrder} />
          </div>
        </div>
      </section>

      <details
        className="admin-card admin-section admin-details"
        open={Boolean(errors.seoTitle || errors.seoDescription) || undefined}
      >
        <summary className="admin-section-title">SEO (opsional)</summary>
        <div className="admin-field">
          <div className="admin-label-row">
            <label className="admin-label" htmlFor="page-seo-title">
              Judul SEO
            </label>
            <Counter value={seoTitle} max={70} />
          </div>
          <input
            id="page-seo-title"
            className="admin-input"
            value={seoTitle}
            onChange={(event) => setSeoTitle(event.target.value)}
            placeholder={title || "Kosongkan untuk memakai judul"}
            aria-invalid={Boolean(errors.seoTitle)}
            aria-describedby={describedBy("seoTitle")}
          />
          <FieldError id="page-seoTitle-error" message={errors.seoTitle} />
        </div>
        <div className="admin-field">
          <div className="admin-label-row">
            <label className="admin-label" htmlFor="page-seo-description">
              Deskripsi SEO
            </label>
            <Counter value={seoDescription} max={160} />
          </div>
          <textarea
            id="page-seo-description"
            className="admin-input admin-textarea"
            value={seoDescription}
            onChange={(event) => setSeoDescription(event.target.value)}
            rows={3}
            placeholder="Kosongkan untuk memakai 160 karakter pertama isi halaman"
            aria-invalid={Boolean(errors.seoDescription)}
            aria-describedby={describedBy("seoDescription")}
          />
          <FieldError id="page-seoDescription-error" message={errors.seoDescription} />
        </div>
      </details>

      <div className="admin-form-footer">
        <Link className="admin-button admin-button-secondary" href="/admin/halaman">
          Batal
        </Link>
        <button type="submit" className="admin-button admin-button-primary" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
    </form>
  );
}
