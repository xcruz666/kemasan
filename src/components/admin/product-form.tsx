"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { saveProductAction } from "@/app/admin/actions/products";
import { initialFormState } from "@/app/admin/actions/form-state";
import { slugify } from "@/lib/content/slug";
import type { Category, ImageRef, Product, Status } from "@/lib/content/types";
import { priceLabel } from "@/lib/format";
import { Counter, FieldError, FormMessage, submitWithoutReset } from "./form-parts";
import { ImageGalleryField } from "./image-field";
import { MarkdownEditor } from "./markdown-editor";

type SpecRow = { key: number; label: string; value: string };

let nextSpecKey = 0;
const specRow = (label = "", value = ""): SpecRow => ({ key: nextSpecKey++, label, value });

export function ProductForm({
  product,
  categories,
  notice,
}: {
  product?: Product;
  categories: Category[];
  notice?: string;
}) {
  const [state, formAction, pending] = useActionState(saveProductAction, initialFormState);
  const errors = state.errors;

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(product));
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [summary, setSummary] = useState(product?.summary ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [specs, setSpecs] = useState<SpecRow[]>(() =>
    product?.specs.length
      ? product.specs.map((spec) => specRow(spec.label, spec.value))
      : [specRow()],
  );
  const [price, setPrice] = useState(product?.price === null || !product ? "" : String(product.price));
  const [priceUnit, setPriceUnit] = useState(product?.priceUnit ?? "");
  const [images, setImages] = useState<ImageRef[]>(product?.images ?? []);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [status, setStatus] = useState<Status>(product?.status ?? "draft");
  const [sortOrder, setSortOrder] = useState(String(product?.sortOrder ?? 0));
  const [seoTitle, setSeoTitle] = useState(product?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(product?.seoDescription ?? "");

  const payload = JSON.stringify({
    name,
    slug,
    categoryId: categoryId || null,
    summary,
    description,
    specs: specs.map(({ label, value }) => ({ label, value })),
    price: price === "" ? null : Number(price),
    priceUnit,
    images,
    featured,
    status,
    sortOrder: sortOrder.trim() === "" ? 0 : Number(sortOrder),
    seoTitle,
    seoDescription,
  });

  function changeName(value: string) {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  function changeSlug(value: string) {
    setSlug(value);
    setSlugEdited(value !== "");
  }

  function changeSpec(key: number, field: "label" | "value", value: string) {
    setSpecs((current) =>
      current.map((spec) => (spec.key === key ? { ...spec, [field]: value } : spec)),
    );
  }

  const describedBy = (field: string) => (errors[field] ? `product-${field}-error` : undefined);

  return (
    <form className="admin-form" onSubmit={submitWithoutReset(formAction)}>
      <input type="hidden" name="payload" value={payload} />
      {product && <input type="hidden" name="id" value={product.id} />}

      <FormMessage state={state} notice={notice} />

      <section className="admin-card admin-section">
        <h2 className="admin-section-title">Informasi produk</h2>

        <div className="admin-field">
          <label className="admin-label" htmlFor="product-name">
            Nama
          </label>
          <input
            id="product-name"
            className="admin-input"
            value={name}
            onChange={(event) => changeName(event.target.value)}
            maxLength={120}
            required
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy("name")}
          />
          <FieldError id="product-name-error" message={errors.name} />
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="product-slug">
            Slug
          </label>
          <div className="admin-input-prefix">
            <span aria-hidden="true">/katalog/</span>
            <input
              id="product-slug"
              className="admin-input"
              value={slug}
              onChange={(event) => changeSlug(event.target.value)}
              maxLength={80}
              required
              aria-invalid={Boolean(errors.slug)}
              aria-describedby={["product-slug-help", describedBy("slug")].filter(Boolean).join(" ")}
            />
          </div>
          <p className="admin-help" id="product-slug-help">
            Huruf kecil, angka, dan tanda hubung. Terisi otomatis dari nama.
          </p>
          <FieldError id="product-slug-error" message={errors.slug} />
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="product-category">
            Kategori
          </label>
          <select
            id="product-category"
            className="admin-input"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            aria-invalid={Boolean(errors.categoryId)}
            aria-describedby={describedBy("categoryId")}
          >
            <option value="">Tanpa kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <p className="admin-help">
            <Link className="admin-link" href="/admin/kategori">
              Kelola kategori
            </Link>
          </p>
          <FieldError id="product-categoryId-error" message={errors.categoryId} />
        </div>

        <div className="admin-field">
          <div className="admin-label-row">
            <label className="admin-label" htmlFor="product-summary">
              Ringkasan
            </label>
            <Counter value={summary} max={200} />
          </div>
          <textarea
            id="product-summary"
            className="admin-input admin-textarea"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            rows={3}
            required
            aria-invalid={Boolean(errors.summary)}
            aria-describedby={["product-summary-help", describedBy("summary")].filter(Boolean).join(" ")}
          />
          <p className="admin-help" id="product-summary-help">
            Tampil di kartu katalog dan dipakai sebagai deskripsi di Google kalau Deskripsi SEO kosong.
          </p>
          <FieldError id="product-summary-error" message={errors.summary} />
        </div>

        <MarkdownEditor
          id="product-description"
          label="Deskripsi"
          value={description}
          onChange={setDescription}
          error={errors.description}
        />
      </section>

      <section className="admin-card admin-section">
        <h2 className="admin-section-title">Spesifikasi</h2>
        <p className="admin-help">Contoh: Ketebalan — 75 mikron. Baris kosong diabaikan.</p>
        <ul className="admin-specs">
          {specs.map((spec, index) => (
            <li className="admin-spec-row" key={spec.key}>
              <input
                className="admin-input"
                value={spec.label}
                onChange={(event) => changeSpec(spec.key, "label", event.target.value)}
                maxLength={60}
                placeholder="Label"
                aria-label={`Label spesifikasi ${index + 1}`}
              />
              <input
                className="admin-input"
                value={spec.value}
                onChange={(event) => changeSpec(spec.key, "value", event.target.value)}
                maxLength={120}
                placeholder="Nilai"
                aria-label={`Nilai spesifikasi ${index + 1}`}
              />
              <button
                type="button"
                className="admin-icon-button admin-icon-button-danger"
                onClick={() => setSpecs((current) => current.filter((item) => item.key !== spec.key))}
                aria-label={`Hapus spesifikasi ${index + 1}`}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="admin-button admin-button-secondary admin-button-small"
          onClick={() => setSpecs((current) => [...current, specRow()])}
          disabled={specs.length >= 30}
        >
          <Plus size={16} aria-hidden="true" /> Tambah baris
        </button>
        <FieldError id="product-specs-error" message={errors.specs} />
      </section>

      <section className="admin-card admin-section">
        <h2 className="admin-section-title">Harga</h2>
        <div className="admin-field-row">
          <div className="admin-field">
            <label className="admin-label" htmlFor="product-price">
              Harga (Rp)
            </label>
            <input
              id="product-price"
              className="admin-input"
              inputMode="numeric"
              value={price}
              onChange={(event) => setPrice(event.target.value.replace(/\D/g, "").slice(0, 13))}
              placeholder="Kosongkan untuk “Tanya harga”"
              aria-invalid={Boolean(errors.price)}
              aria-describedby={describedBy("price")}
            />
            <FieldError id="product-price-error" message={errors.price} />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="product-price-unit">
              Satuan harga
            </label>
            <input
              id="product-price-unit"
              className="admin-input"
              value={priceUnit}
              onChange={(event) => setPriceUnit(event.target.value)}
              maxLength={40}
              placeholder="Contoh: pack, roll, lembar"
              aria-invalid={Boolean(errors.priceUnit)}
              aria-describedby={describedBy("priceUnit")}
            />
            <FieldError id="product-priceUnit-error" message={errors.priceUnit} />
          </div>
        </div>
        <p className="admin-help">
          Tampil sebagai:{" "}
          <strong>{priceLabel({ price: price === "" ? null : Number(price), priceUnit })}</strong>
        </p>
      </section>

      <section className="admin-card admin-section">
        <h2 className="admin-section-title">Foto</h2>
        <ImageGalleryField
          id="product-images"
          label="Foto produk"
          images={images}
          onChange={setImages}
          error={errors.images}
        />
      </section>

      <section className="admin-card admin-section">
        <h2 className="admin-section-title">Tampilan</h2>
        <label className="admin-check">
          <input
            type="checkbox"
            checked={featured}
            onChange={(event) => setFeatured(event.target.checked)}
          />
          <span>Unggulan (tampil di section “Produk unggulan” beranda)</span>
        </label>
        <div className="admin-field-row">
          <div className="admin-field">
            <label className="admin-label" htmlFor="product-status">
              Status
            </label>
            <select
              id="product-status"
              className="admin-input"
              value={status}
              onChange={(event) => setStatus(event.target.value as Status)}
              aria-invalid={Boolean(errors.status)}
            >
              <option value="draft">Draf</option>
              <option value="published">Terbit</option>
            </select>
            <FieldError id="product-status-error" message={errors.status} />
          </div>
          <div className="admin-field">
            <label className="admin-label" htmlFor="product-sort">
              Urutan
            </label>
            <input
              id="product-sort"
              className="admin-input"
              type="number"
              step={1}
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              aria-invalid={Boolean(errors.sortOrder)}
              aria-describedby={["product-sort-help", describedBy("sortOrder")].filter(Boolean).join(" ")}
            />
            <p className="admin-help" id="product-sort-help">
              Angka kecil tampil lebih dulu di katalog.
            </p>
            <FieldError id="product-sortOrder-error" message={errors.sortOrder} />
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
            <label className="admin-label" htmlFor="product-seo-title">
              Judul SEO
            </label>
            <Counter value={seoTitle} max={70} />
          </div>
          <input
            id="product-seo-title"
            className="admin-input"
            value={seoTitle}
            onChange={(event) => setSeoTitle(event.target.value)}
            placeholder={name || "Kosongkan untuk memakai nama produk"}
            aria-invalid={Boolean(errors.seoTitle)}
            aria-describedby={describedBy("seoTitle")}
          />
          <FieldError id="product-seoTitle-error" message={errors.seoTitle} />
        </div>
        <div className="admin-field">
          <div className="admin-label-row">
            <label className="admin-label" htmlFor="product-seo-description">
              Deskripsi SEO
            </label>
            <Counter value={seoDescription} max={160} />
          </div>
          <textarea
            id="product-seo-description"
            className="admin-input admin-textarea"
            value={seoDescription}
            onChange={(event) => setSeoDescription(event.target.value)}
            rows={3}
            placeholder={summary || "Kosongkan untuk memakai ringkasan"}
            aria-invalid={Boolean(errors.seoDescription)}
            aria-describedby={describedBy("seoDescription")}
          />
          <FieldError id="product-seoDescription-error" message={errors.seoDescription} />
        </div>
      </details>

      <div className="admin-form-footer">
        <Link className="admin-button admin-button-secondary" href="/admin/produk">
          Batal
        </Link>
        <button type="submit" className="admin-button admin-button-primary" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
    </form>
  );
}
