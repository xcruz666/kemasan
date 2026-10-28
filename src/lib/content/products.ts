import { randomUUID } from "node:crypto";
import path from "node:path";
import { listCategories } from "./categories";
import { dataPath } from "./data-dir";
import {
  type JsonCollection,
  readJson,
  readJsonDirectory,
  removeFile,
  writeJsonAtomic,
} from "./storage";
import type { FieldErrors, Product, ProductInput, Result } from "./types";
import { isProduct } from "./validation";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const productsDirectory = () => dataPath("products");
const productFile = (id: string) => path.join(productsDirectory(), `${id}.json`);

const byOrder = (a: Product, b: Product) =>
  a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "id");

/** Throws when the data folder cannot be read. Admin use. */
export async function listProducts(): Promise<JsonCollection<Product>> {
  const collection = await readJsonDirectory(productsDirectory(), isProduct);
  collection.items.sort(byOrder);
  return collection;
}

export async function getProduct(id: string): Promise<Product | null> {
  if (!UUID_PATTERN.test(id)) return null;
  const value = await readJson(productFile(id));
  return isProduct(value) ? value : null;
}

export async function saveProduct(input: ProductInput, id?: string): Promise<Result<Product>> {
  const [{ items }, categories] = await Promise.all([listProducts(), listCategories()]);
  const existing = id ? items.find((product) => product.id === id) : undefined;
  if (id && !existing) return { ok: false, errors: { form: "Produk tidak ditemukan." } };

  const errors: FieldErrors = {};
  if (items.some((product) => product.slug === input.slug && product.id !== id)) {
    errors.slug = "Slug sudah dipakai produk lain.";
  }
  if (input.categoryId && !categories.some((category) => category.id === input.categoryId)) {
    errors.categoryId = "Kategori tidak ditemukan.";
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const now = new Date().toISOString();
  const product: Product = {
    ...input,
    id: existing?.id ?? randomUUID(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await writeJsonAtomic(productFile(product.id), product);
  return { ok: true, value: product };
}

export async function deleteProduct(id: string): Promise<Product | null> {
  const product = await getProduct(id);
  if (product) await removeFile(productFile(id));
  return product;
}

/* Public helpers: never throw, so a data problem cannot take the site down. */

export async function getPublishedProducts(): Promise<Product[]> {
  try {
    return (await listProducts()).items.filter((product) => product.status === "published");
  } catch (error) {
    console.error("[content] Gagal membaca produk:", error);
    return [];
  }
}

export async function getPublishedProductBySlug(slug: string): Promise<Product | null> {
  return (await getPublishedProducts()).find((product) => product.slug === slug) ?? null;
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  return (await getPublishedProducts()).filter((product) => product.featured).slice(0, limit);
}
