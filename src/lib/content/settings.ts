import { cache } from "react";
import { dataPath } from "./data-dir";
import { listPages } from "./pages";
import { getSiteUrl } from "@/lib/site-url";
import { readJson, writeJsonAtomic } from "./storage";
import {
  DEFAULT_MENU_LINKS,
  DEFAULT_SEO,
  DEFAULT_SITE,
  DEFAULT_WHATSAPP,
  type MenuItem,
  type SeoSettings,
  type SiteIdentity,
  type SiteSettings,
  type WhatsappSettings,
  defaultMenuItems,
  formatWhatsappDisplay,
  normalizeSeoSettings,
  normalizeSiteIdentity,
  parseMenuItem,
  validateWhatsappInput,
} from "./settings-shared";
import type { Page } from "./types";

const settingsFile = () => dataPath("settings.json");

/** First-run menu: the five defaults plus pages that were ticked "Tampil di menu". */
async function initialMenu(): Promise<MenuItem[]> {
  const { items } = await listPages();
  return [
    ...defaultMenuItems(),
    ...items
      .filter((page) => page.showInMenu)
      .map((page): MenuItem => ({
        id: `page-${page.id}`,
        kind: "page",
        pageId: page.id,
        label: "",
        visible: true,
      })),
  ];
}

/** Keep valid items and re-add any default item that is missing. */
function normalizeMenu(raw: unknown): MenuItem[] | null {
  if (!Array.isArray(raw)) return null;
  const unique: MenuItem[] = [];
  for (const entry of raw) {
    const parsed = parseMenuItem(entry);
    if ("item" in parsed && !unique.some((item) => item.id === parsed.item.id)) {
      unique.push(parsed.item);
    }
  }
  for (const item of defaultMenuItems()) {
    if (!unique.some((existing) => existing.id === item.id)) unique.push(item);
  }
  return unique;
}

/** Throws when the data folder cannot be read. Admin use. */
export async function readSettings(): Promise<SiteSettings> {
  let value: unknown = null;
  try {
    value = await readJson(settingsFile());
  } catch (error) {
    // A corrupt file falls back to defaults so the admin can save over it.
    if (!(error instanceof SyntaxError)) throw error;
    console.error("[content] settings.json rusak, memakai pengaturan bawaan.");
  }
  const source =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const whatsapp = validateWhatsappInput(source.whatsapp);
  return {
    whatsapp: whatsapp.ok ? whatsapp.value : DEFAULT_WHATSAPP,
    headerMenu: normalizeMenu(source.headerMenu) ?? (await initialMenu()),
    site: normalizeSiteIdentity(source.site),
    seo: normalizeSeoSettings(source.seo),
  };
}

/** Never throws; once per request. Public pages use this. */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    return await readSettings();
  } catch (error) {
    console.error("[content] Gagal membaca pengaturan:", error);
    return {
      whatsapp: DEFAULT_WHATSAPP,
      headerMenu: defaultMenuItems(),
      site: DEFAULT_SITE,
      seo: DEFAULT_SEO,
    };
  }
});

export async function saveWhatsappSettings(whatsapp: WhatsappSettings) {
  const current = await readSettings();
  await writeJsonAtomic(settingsFile(), { ...current, whatsapp });
}

export async function saveHeaderMenu(headerMenu: MenuItem[]) {
  const current = await readSettings();
  await writeJsonAtomic(settingsFile(), { ...current, headerMenu });
}

export async function saveSiteIdentity(site: SiteIdentity) {
  const current = await readSettings();
  await writeJsonAtomic(settingsFile(), { ...current, site });
}

export async function saveSeoSettings(seo: SeoSettings) {
  const current = await readSettings();
  await writeJsonAtomic(settingsFile(), { ...current, seo });
}

/**
 * Origin for canonical URLs, the sitemap, and link previews: the admin's
 * canonical domain when set, otherwise SITE_URL. Undefined when neither is set.
 */
export async function getPublicOrigin(): Promise<URL | undefined> {
  const { seo } = await getSiteSettings();
  if (seo.canonicalOrigin) return new URL(new URL(seo.canonicalOrigin).origin);
  return getSiteUrl();
}

export type ResolvedMenuLink = { label: string; href: string; external: boolean };

/** Visible items only; page items need a published page. */
export function resolveHeaderMenu(menu: MenuItem[], publishedPages: Page[]): ResolvedMenuLink[] {
  const links: ResolvedMenuLink[] = [];
  for (const item of menu) {
    if (!item.visible) continue;
    if (item.kind === "default") {
      const link = DEFAULT_MENU_LINKS.find((entry) => entry.key === item.id);
      if (link) links.push({ label: link.label, href: link.href, external: false });
    } else if (item.kind === "page") {
      const page = publishedPages.find((entry) => entry.id === item.pageId);
      if (page) links.push({ label: item.label || page.title, href: `/${page.slug}`, external: false });
    } else {
      links.push({ label: item.label, href: item.href, external: /^https?:/i.test(item.href) });
    }
  }
  return links;
}

/** Everything the public site needs to render WhatsApp buttons. */
export type WhatsappContact = WhatsappSettings & {
  display: string;
  international: string;
};

export function toWhatsappContact(settings: WhatsappSettings): WhatsappContact {
  return {
    ...settings,
    display: formatWhatsappDisplay(settings.phone),
    international: `+${settings.phone}`,
  };
}
