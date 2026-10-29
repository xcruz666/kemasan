import { isImageRef } from "./image-ref";
import { canonicalUrlError, URL_MAX } from "./settings-shared";
import { RESERVED_PAGE_SLUGS, SLUG_MAX_LENGTH, SLUG_PATTERN } from "./slug";
import type {
  Category,
  CategoryInput,
  FieldErrors,
  ImageRef,
  Page,
  PageInput,
  Product,
  ProductInput,
  Result,
  Spec,
  Status,
} from "./types";

type Source = Record<string, unknown>;

function asSource(raw: unknown): Source {
  return raw && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as Source)
    : {};
}

function readText(
  source: Source,
  key: string,
  errors: FieldErrors,
  { label, max, required = false }: { label: string; max: number; required?: boolean },
): string {
  const value = typeof source[key] === "string" ? (source[key] as string).trim() : "";
  if (required && !value) errors[key] = `${label} wajib diisi.`;
  else if (value.length > max) errors[key] = `${label} maksimal ${max} karakter.`;
  return value;
}

function readSlug(source: Source, errors: FieldErrors): string {
  const value = readText(source, "slug", errors, {
    label: "Slug",
    max: SLUG_MAX_LENGTH,
    required: true,
  });
  if (value && !errors.slug && !SLUG_PATTERN.test(value)) {
    errors.slug = "Slug hanya boleh huruf kecil, angka, dan tanda hubung.";
  }
  return value;
}

function readStatus(source: Source, errors: FieldErrors): Status {
  const value = source.status;
  if (value === "draft" || value === "published") return value;
  errors.status = "Status tidak valid.";
  return "draft";
}

function readInteger(source: Source, key: string, errors: FieldErrors, label: string): number {
  const value = source[key];
  if (value === undefined || value === null || value === "") return 0;
  if (typeof value === "number" && Number.isInteger(value) && Math.abs(value) <= 1_000_000) {
    return value;
  }
  errors[key] = `${label} harus bilangan bulat.`;
  return 0;
}

function readImage(raw: unknown, key: string, errors: FieldErrors): ImageRef | null {
  if (!isImageRef(raw)) {
    errors[key] = "Data foto tidak valid. Upload ulang fotonya.";
    return null;
  }
  const alt = raw.alt.trim();
  if (!alt) errors[key] = "Teks alt foto wajib diisi.";
  else if (alt.length > 160) errors[key] = "Teks alt foto maksimal 160 karakter.";
  return { file: raw.file, alt, width: raw.width, height: raw.height };
}

function readCanonical(source: Source, errors: FieldErrors): string {
  const value = readText(source, "canonicalUrl", errors, { label: "Canonical URL", max: URL_MAX });
  const error = canonicalUrlError(value);
  if (error && !errors.canonicalUrl) errors.canonicalUrl = error;
  return value;
}

function result<T>(value: T, errors: FieldErrors): Result<T> {
  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, value };
}

export function validateProductInput(raw: unknown): Result<ProductInput> {
  const source = asSource(raw);
  const errors: FieldErrors = {};

  const name = readText(source, "name", errors, { label: "Nama produk", max: 120, required: true });
  const slug = readSlug(source, errors);
  const summary = readText(source, "summary", errors, { label: "Ringkasan", max: 200, required: true });
  const description = readText(source, "description", errors, { label: "Deskripsi", max: 20000 });
  const priceUnit = readText(source, "priceUnit", errors, { label: "Satuan harga", max: 40 });
  const seoTitle = readText(source, "seoTitle", errors, { label: "Judul SEO", max: 70 });
  const seoDescription = readText(source, "seoDescription", errors, { label: "Deskripsi SEO", max: 160 });

  let categoryId: string | null = null;
  if (typeof source.categoryId === "string" && source.categoryId) categoryId = source.categoryId;

  let price: number | null = null;
  if (source.price !== null && source.price !== undefined && source.price !== "") {
    if (
      typeof source.price === "number" &&
      Number.isInteger(source.price) &&
      source.price >= 0 &&
      source.price <= 1_000_000_000_000
    ) {
      price = source.price;
    } else {
      errors.price = "Harga harus angka rupiah tanpa desimal.";
    }
  }

  const specs: Spec[] = [];
  const rawSpecs = Array.isArray(source.specs) ? source.specs : [];
  if (rawSpecs.length > 30) errors.specs = "Spesifikasi maksimal 30 baris.";
  for (const item of rawSpecs.slice(0, 30)) {
    const spec = asSource(item);
    const label = typeof spec.label === "string" ? spec.label.trim() : "";
    const value = typeof spec.value === "string" ? spec.value.trim() : "";
    if (!label && !value) continue;
    if (!label || !value) errors.specs = "Setiap baris spesifikasi butuh label dan nilai.";
    else if (label.length > 60 || value.length > 120) {
      errors.specs = "Label spesifikasi maksimal 60 karakter, nilai maksimal 120 karakter.";
    }
    specs.push({ label, value });
  }

  const images: ImageRef[] = [];
  const rawImages = Array.isArray(source.images) ? source.images : [];
  if (rawImages.length > 10) errors.images = "Foto maksimal 10.";
  for (const item of rawImages.slice(0, 10)) {
    const image = readImage(item, "images", errors);
    if (image) images.push(image);
  }

  return result<ProductInput>(
    {
      slug,
      name,
      categoryId,
      summary,
      description,
      specs,
      price,
      priceUnit,
      images,
      featured: source.featured === true,
      status: readStatus(source, errors),
      sortOrder: readInteger(source, "sortOrder", errors, "Urutan"),
      seoTitle,
      seoDescription,
      canonicalUrl: readCanonical(source, errors),
    },
    errors,
  );
}

export function validatePageInput(raw: unknown): Result<PageInput> {
  const source = asSource(raw);
  const errors: FieldErrors = {};

  const title = readText(source, "title", errors, { label: "Judul", max: 120, required: true });
  const slug = readSlug(source, errors);
  if (slug && RESERVED_PAGE_SLUGS.has(slug)) {
    errors.slug = `Slug "${slug}" sudah dipakai sistem. Pilih slug lain.`;
  }
  const body = readText(source, "body", errors, { label: "Isi halaman", max: 50000, required: true });
  const seoTitle = readText(source, "seoTitle", errors, { label: "Judul SEO", max: 70 });
  const seoDescription = readText(source, "seoDescription", errors, { label: "Deskripsi SEO", max: 160 });
  const coverImage =
    source.coverImage === null || source.coverImage === undefined
      ? null
      : readImage(source.coverImage, "coverImage", errors);

  return result<PageInput>(
    {
      slug,
      title,
      body,
      coverImage,
      showInMenu: source.showInMenu === true,
      menuOrder: readInteger(source, "menuOrder", errors, "Urutan menu"),
      status: readStatus(source, errors),
      seoTitle,
      seoDescription,
      canonicalUrl: readCanonical(source, errors),
    },
    errors,
  );
}

export function validateCategoryInput(raw: unknown): Result<CategoryInput> {
  const source = asSource(raw);
  const errors: FieldErrors = {};
  const name = readText(source, "name", errors, { label: "Nama kategori", max: 60, required: true });
  const slug = readSlug(source, errors);
  return result<CategoryInput>({ name, slug }, errors);
}

/* Shape checks for files read from disk. */

function hasStrings(value: Source, keys: string[]) {
  return keys.every((key) => typeof value[key] === "string");
}

function isStatus(value: unknown): value is Status {
  return value === "draft" || value === "published";
}

export function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;
  const product = value as Source;
  return (
    hasStrings(product, [
      "id", "slug", "name", "summary", "description", "priceUnit",
      "seoTitle", "seoDescription", "createdAt", "updatedAt",
    ]) &&
    (product.categoryId === null || typeof product.categoryId === "string") &&
    (product.canonicalUrl === undefined || typeof product.canonicalUrl === "string") &&
    (product.price === null || typeof product.price === "number") &&
    Array.isArray(product.specs) &&
    Array.isArray(product.images) &&
    product.images.every(isImageRef) &&
    typeof product.featured === "boolean" &&
    typeof product.sortOrder === "number" &&
    isStatus(product.status)
  );
}

export function isPage(value: unknown): value is Page {
  if (!value || typeof value !== "object") return false;
  const page = value as Source;
  return (
    hasStrings(page, [
      "id", "slug", "title", "body", "seoTitle", "seoDescription", "createdAt", "updatedAt",
    ]) &&
    (page.coverImage === null || isImageRef(page.coverImage)) &&
    (page.canonicalUrl === undefined || typeof page.canonicalUrl === "string") &&
    typeof page.showInMenu === "boolean" &&
    typeof page.menuOrder === "number" &&
    isStatus(page.status)
  );
}

export function isCategory(value: unknown): value is Category {
  if (!value || typeof value !== "object") return false;
  const category = value as Source;
  return hasStrings(category, ["id", "slug", "name"]) && typeof category.sortOrder === "number";
}
