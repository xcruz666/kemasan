import { randomUUID } from "node:crypto";
import { dataPath } from "./data-dir";
import { readJson, readJsonDirectory, writeJsonAtomic } from "./storage";
import type { Category, CategoryInput, Result } from "./types";
import { isCategory, isProduct } from "./validation";

const categoriesFile = () => dataPath("categories.json");

const bySortOrder = (a: Category, b: Category) =>
  a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "id");

/** Throws when the data folder cannot be read. Admin use. */
export async function listCategories(): Promise<Category[]> {
  const value = await readJson(categoriesFile());
  if (value === null) return [];
  if (!Array.isArray(value)) throw new Error("categories.json rusak: isinya harus berupa daftar.");
  return value.filter(isCategory).sort(bySortOrder);
}

/** Never throws. Public pages use this so a data problem cannot take the site down. */
export async function getCategoriesSafe(): Promise<Category[]> {
  try {
    return await listCategories();
  } catch (error) {
    console.error("[content] Gagal membaca kategori:", error);
    return [];
  }
}

export async function createCategory(input: CategoryInput): Promise<Result<Category>> {
  const categories = await listCategories();
  if (categories.some((category) => category.slug === input.slug)) {
    return { ok: false, errors: { slug: "Slug sudah dipakai kategori lain." } };
  }
  const category: Category = {
    id: randomUUID(),
    ...input,
    sortOrder: Math.max(0, ...categories.map((item) => item.sortOrder)) + 1,
  };
  await writeJsonAtomic(categoriesFile(), [...categories, category]);
  return { ok: true, value: category };
}

export async function updateCategory(id: string, input: CategoryInput): Promise<Result<Category>> {
  const categories = await listCategories();
  const existing = categories.find((category) => category.id === id);
  if (!existing) return { ok: false, errors: { form: "Kategori tidak ditemukan." } };
  if (categories.some((category) => category.slug === input.slug && category.id !== id)) {
    return { ok: false, errors: { slug: "Slug sudah dipakai kategori lain." } };
  }
  const updated: Category = { ...existing, ...input };
  await writeJsonAtomic(
    categoriesFile(),
    categories.map((category) => (category.id === id ? updated : category)),
  );
  return { ok: true, value: updated };
}

export async function deleteCategory(id: string): Promise<Result<null>> {
  const categories = await listCategories();
  if (!categories.some((category) => category.id === id)) {
    return { ok: false, errors: { form: "Kategori tidak ditemukan." } };
  }
  const products = await readJsonDirectory(dataPath("products"), isProduct);
  if (products.items.some((product) => product.categoryId === id)) {
    return {
      ok: false,
      errors: { form: "Kategori masih dipakai produk. Pindahkan produknya dulu." },
    };
  }
  await writeJsonAtomic(
    categoriesFile(),
    categories.filter((category) => category.id !== id),
  );
  return { ok: true, value: null };
}
