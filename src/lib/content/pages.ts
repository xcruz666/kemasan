import { randomUUID } from "node:crypto";
import path from "node:path";
import { dataPath } from "./data-dir";
import {
  type JsonCollection,
  readJson,
  readJsonDirectory,
  removeFile,
  writeJsonAtomic,
} from "./storage";
import type { Page, PageInput, Result } from "./types";
import { isPage } from "./validation";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const pagesDirectory = () => dataPath("pages");
const pageFile = (id: string) => path.join(pagesDirectory(), `${id}.json`);

const byMenuOrder = (a: Page, b: Page) =>
  a.menuOrder - b.menuOrder || a.title.localeCompare(b.title, "id");

/** Throws when the data folder cannot be read. Admin use. */
export async function listPages(): Promise<JsonCollection<Page>> {
  const collection = await readJsonDirectory(pagesDirectory(), isPage);
  collection.items.sort(byMenuOrder);
  return collection;
}

export async function getPage(id: string): Promise<Page | null> {
  if (!UUID_PATTERN.test(id)) return null;
  const value = await readJson(pageFile(id));
  return isPage(value) ? value : null;
}

/** Reserved slugs are rejected earlier by validatePageInput. */
export async function savePage(input: PageInput, id?: string): Promise<Result<Page>> {
  const { items } = await listPages();
  const existing = id ? items.find((page) => page.id === id) : undefined;
  if (id && !existing) return { ok: false, errors: { form: "Halaman tidak ditemukan." } };
  if (items.some((page) => page.slug === input.slug && page.id !== id)) {
    return { ok: false, errors: { slug: "Slug sudah dipakai halaman lain." } };
  }

  const now = new Date().toISOString();
  const page: Page = {
    ...input,
    id: existing?.id ?? randomUUID(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  await writeJsonAtomic(pageFile(page.id), page);
  return { ok: true, value: page };
}

export async function deletePage(id: string): Promise<Page | null> {
  const page = await getPage(id);
  if (page) await removeFile(pageFile(id));
  return page;
}

/* Public helpers: never throw, so a data problem cannot take the site down. */

export async function getPublishedPages(): Promise<Page[]> {
  try {
    return (await listPages()).items.filter((page) => page.status === "published");
  } catch (error) {
    console.error("[content] Gagal membaca halaman:", error);
    return [];
  }
}

export async function getPublishedPageBySlug(slug: string): Promise<Page | null> {
  return (await getPublishedPages()).find((page) => page.slug === slug) ?? null;
}

export async function getMenuPages(): Promise<Page[]> {
  return (await getPublishedPages()).filter((page) => page.showInMenu);
}
