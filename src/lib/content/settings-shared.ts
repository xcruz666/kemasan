/** Client-safe settings types, defaults, and validation. */
import { isImageRef } from "./image-ref";
import type { FieldErrors, ImageRef, Result } from "./types";

export type DefaultMenuKey = "produk" | "katalog" | "keunggulan" | "cara-pesan" | "faq";

export const DEFAULT_MENU_LINKS: { key: DefaultMenuKey; label: string; href: string }[] = [
  { key: "produk", label: "Produk", href: "/#produk" },
  { key: "katalog", label: "Katalog", href: "/katalog" },
  { key: "keunggulan", label: "Keunggulan", href: "/#keunggulan" },
  { key: "cara-pesan", label: "Cara pesan", href: "/#cara-pesan" },
  { key: "faq", label: "FAQ", href: "/#faq" },
];

/**
 * Default items can only be hidden or moved. Page items point at a page id so a
 * slug change never breaks the menu. Link items hold a free URL.
 */
export type MenuItem =
  | { id: DefaultMenuKey; kind: "default"; visible: boolean }
  | { id: string; kind: "page"; pageId: string; label: string; visible: boolean }
  | { id: string; kind: "link"; label: string; href: string; visible: boolean };

export type WhatsappSettings = {
  /** International digits without "+", e.g. 628122220195. */
  phone: string;
  defaultMessage: string;
};

/** Site-wide text around every public page. Footer navigation stays fixed. */
export type SiteIdentity = {
  /** og:site_name, the title suffix, structured data, and the footer copyright. */
  siteName: string;
  announcement: { visible: boolean; text: string; linkLabel: string; linkHref: string };
  footer: { tagline: string; bottomText: string };
  headerCtaLabel: string;
  floatingLabel: string;
};

/** SEO for one built-in page. Empty fields fall back to the page title and description. */
export type PageSeo = {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: ImageRef | null;
  /** Absolute URL; empty means origin + path. */
  canonical: string;
};

export type SeoSettings = {
  /** e.g. https://optimakemasanprima.com; empty uses SITE_URL. */
  canonicalOrigin: string;
  /** Adds " | <siteName>" after every page title. */
  appendSiteName: boolean;
  defaultDescription: string;
  /** Link preview image for pages without their own; null uses /images/optima-social.jpg. */
  defaultOgImage: ImageRef | null;
  defaultOgImageAlt: string;
  /** Square PNG/WebP; null uses /icon.svg. */
  favicon: ImageRef | null;
  pages: { home: PageSeo; katalog: PageSeo };
};

export type SiteSettings = {
  whatsapp: WhatsappSettings;
  headerMenu: MenuItem[];
  site: SiteIdentity;
  seo: SeoSettings;
};

export const DEFAULT_SITE: SiteIdentity = {
  siteName: "Optima Kemasan Prima",
  announcement: {
    visible: true,
    text: "KEMAS LEBIH BAIK. TUMBUH LEBIH JAUH.",
    linkLabel: "Terbuka untuk pemesanan grosir",
    linkHref: "/#konsultasi",
  },
  footer: { tagline: "Kemasan baik.\nKesegaran terjaga.", bottomText: "Partner kemasan untuk usaha Anda." },
  headerCtaLabel: "Hubungi kami",
  floatingLabel: "Chat kami",
};

export const DEFAULT_OG_IMAGE = {
  url: "/images/optima-social.jpg",
  width: 1200,
  height: 630,
  alt: "Kantong vacuum premium berisi salmon dan sayuran",
};

const emptyPageSeo = (title: string, description: string): PageSeo => ({
  title,
  description,
  ogTitle: "",
  ogDescription: "",
  ogImage: null,
  canonical: "",
});

export const DEFAULT_SEO: SeoSettings = {
  canonicalOrigin: "",
  appendSiteName: true,
  defaultDescription:
    "Jual kantong vacuum premium untuk kebutuhan usaha dan grosir. Material Nylon + LLDPE, ketebalan standar 75 mikron. Konsultasikan ukuran via WhatsApp.",
  defaultOgImage: null,
  defaultOgImageAlt: DEFAULT_OG_IMAGE.alt,
  favicon: null,
  pages: {
    home: emptyPageSeo(
      "Kantong Vacuum Premium untuk Bisnis",
      "Jual kantong vacuum premium untuk kebutuhan usaha dan grosir. Material Nylon + LLDPE, ketebalan standar 75 mikron. Konsultasikan ukuran via WhatsApp.",
    ),
    katalog: emptyPageSeo(
      "Katalog Kantong Vacuum",
      "Katalog kantong vacuum Optima Kemasan Prima untuk usaha dan grosir. Lihat ukuran, spesifikasi, dan harga, lalu konsultasikan kebutuhan Anda via WhatsApp.",
    ),
  },
};

export const SITE_NAME_MAX = 60;
export const SEO_TITLE_MAX = 70;
export const SEO_DESCRIPTION_MAX = 160;
/** Link preview descriptions may run a little longer than meta descriptions. */
export const OG_DESCRIPTION_MAX = 200;
export const URL_MAX = 300;

export const MENU_MAX_ITEMS = 12;
export const MENU_LABEL_MAX = 30;
export const WHATSAPP_MESSAGE_MAX = 500;

export const DEFAULT_WHATSAPP: WhatsappSettings = {
  phone: "628122220195",
  defaultMessage:
    "Halo Optima Kemasan Prima, saya ingin konsultasi dan mendapatkan penawaran kantong vacuum untuk usaha saya.",
};

const DEFAULT_KEYS = new Set<string>(DEFAULT_MENU_LINKS.map((link) => link.key));

export function defaultMenuItems(): MenuItem[] {
  return DEFAULT_MENU_LINKS.map((link) => ({ id: link.key, kind: "default", visible: true }));
}

/** Accepts 0812-2220-195, +62 812 2220 195, 628122220195. Returns 628… or null. */
export function normalizeWhatsappPhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith("8")) digits = `62${digits}`;
  if (!/^62[1-9]\d{7,12}$/.test(digits)) return null;
  return digits;
}

/** 628122220195 → 0812-2220-195 */
export function formatWhatsappDisplay(phone: string): string {
  const national = phone.startsWith("62") ? `0${phone.slice(2)}` : phone;
  return national.match(/.{1,4}/g)?.join("-") ?? national;
}

/** Relative paths and http(s) only; "//host" and "javascript:" are rejected. */
export function isSafeMenuHref(href: string): boolean {
  if (href.startsWith("/")) return !href.startsWith("//");
  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function asRecord(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};
}

export function validateWhatsappInput(raw: unknown): Result<WhatsappSettings> {
  const source = asRecord(raw);
  const errors: FieldErrors = {};
  const phone = normalizeWhatsappPhone(typeof source.phone === "string" ? source.phone : "");
  if (!phone) errors.phone = "Nomor WhatsApp tidak valid. Contoh: 0812-2220-195.";
  const defaultMessage =
    typeof source.defaultMessage === "string" ? source.defaultMessage.trim() : "";
  if (!defaultMessage) errors.defaultMessage = "Pesan pembuka wajib diisi.";
  else if (defaultMessage.length > WHATSAPP_MESSAGE_MAX) {
    errors.defaultMessage = `Pesan pembuka maksimal ${WHATSAPP_MESSAGE_MAX} karakter.`;
  }
  return Object.keys(errors).length > 0
    ? { ok: false, errors }
    : { ok: true, value: { phone: phone as string, defaultMessage } };
}

/** Checks one menu item on its own (shape, label, URL). Duplicates are checked by the caller. */
export function parseMenuItem(entry: unknown): { item: MenuItem } | { error: string } {
  const item = asRecord(entry);
  const id = typeof item.id === "string" ? item.id : "";
  const visible = item.visible !== false;
  if (!id) return { error: "Item menu tidak valid." };

  if (item.kind === "default") {
    return DEFAULT_KEYS.has(id)
      ? { item: { id: id as DefaultMenuKey, kind: "default", visible } }
      : { error: "Item bawaan tidak dikenal." };
  }

  const label = typeof item.label === "string" ? item.label.trim() : "";
  if (label.length > MENU_LABEL_MAX) return { error: `Label maksimal ${MENU_LABEL_MAX} karakter.` };

  if (item.kind === "page") {
    const pageId = typeof item.pageId === "string" ? item.pageId : "";
    return pageId
      ? { item: { id, kind: "page", pageId, label, visible } }
      : { error: "Pilih halaman untuk item ini." };
  }

  if (item.kind === "link") {
    const href = typeof item.href === "string" ? item.href.trim() : "";
    if (!label) return { error: "Label link wajib diisi." };
    if (!href || !isSafeMenuHref(href)) return { error: "URL harus diawali / atau https://." };
    return { item: { id, kind: "link", label, href, visible } };
  }

  return { error: "Jenis item menu tidak dikenal." };
}

/**
 * Validates the whole menu from the admin editor. Field errors are keyed
 * "menu.<index>" so the editor can show them on the right row.
 */
export function validateHeaderMenu(raw: unknown): Result<MenuItem[]> {
  const errors: FieldErrors = {};
  const list = Array.isArray(raw) ? raw : [];
  const items: MenuItem[] = [];
  const seen = new Set<string>();

  list.forEach((entry, index) => {
    const parsed = parseMenuItem(entry);
    if ("error" in parsed) errors[`menu.${index}`] = parsed.error;
    else if (seen.has(parsed.item.id)) errors[`menu.${index}`] = "Item menu tidak valid.";
    else {
      seen.add(parsed.item.id);
      items.push(parsed.item);
    }
  });

  if (items.length > MENU_MAX_ITEMS) errors.menu = `Menu maksimal ${MENU_MAX_ITEMS} item.`;
  for (const link of DEFAULT_MENU_LINKS) {
    if (!items.some((item) => item.id === link.key)) {
      errors.menu = "Item bawaan tidak boleh dihapus, hanya disembunyikan.";
    }
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, value: items };
}

/* Site identity and SEO. */

type Mode = "strict" | "lenient";

function readString(
  source: Record<string, unknown>,
  key: string,
  fallback: string,
  max: number,
  path: string,
  errors: FieldErrors,
  mode: Mode,
  required = false,
): string {
  const raw = source[key];
  if (typeof raw !== "string") {
    if (mode === "strict") errors[path] = "Isian tidak valid.";
    return fallback;
  }
  const value = raw.replace(/\r\n?/g, "\n").trim();
  if (mode === "lenient") return value.slice(0, max) || (required ? fallback : value);
  if (required && !value) errors[path] = "Wajib diisi.";
  else if (value.length > max) errors[path] = `Maksimal ${max} karakter.`;
  return value;
}

function readImage(
  source: Record<string, unknown>,
  key: string,
  path: string,
  errors: FieldErrors,
  mode: Mode,
): ImageRef | null {
  const raw = source[key];
  if (raw === null || raw === undefined) return null;
  if (isImageRef(raw)) return raw;
  if (mode === "strict") errors[path] = "Data foto tidak valid. Upload ulang fotonya.";
  return null;
}

/** Absolute http(s) URL, for canonical overrides. */
export function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

/** Empty, or an absolute http(s) URL. Shared by products, pages, and the SEO settings. */
export function canonicalUrlError(value: string): string | null {
  if (!value) return null;
  if (value.length > URL_MAX) return `Maksimal ${URL_MAX} karakter.`;
  return isAbsoluteHttpUrl(value) ? null : "Harus URL lengkap, contoh https://optimakemasanprima.com/katalog.";
}

/** "https://example.com" → "https://example.com"; anything with a path is rejected. */
export function canonicalOriginError(value: string): string | null {
  if (!value) return null;
  if (!isAbsoluteHttpUrl(value)) return "Harus domain lengkap, contoh https://optimakemasanprima.com.";
  const url = new URL(value);
  if ((url.pathname !== "/" && url.pathname !== "") || url.search || url.hash) {
    return "Isi domain saja, tanpa path. Contoh https://optimakemasanprima.com.";
  }
  return null;
}

function parseSite(raw: unknown, errors: FieldErrors, mode: Mode): SiteIdentity {
  const source = asRecord(raw);
  const announcement = asRecord(source.announcement);
  const footer = asRecord(source.footer);
  const linkHref = readString(announcement, "linkHref", DEFAULT_SITE.announcement.linkHref, URL_MAX, "announcement.linkHref", errors, mode);
  if (linkHref && !isSafeMenuHref(linkHref)) {
    if (mode === "strict") errors["announcement.linkHref"] = "URL harus diawali / atau https://.";
  }
  return {
    siteName: readString(source, "siteName", DEFAULT_SITE.siteName, SITE_NAME_MAX, "siteName", errors, mode, true),
    announcement: {
      visible: typeof announcement.visible === "boolean" ? announcement.visible : DEFAULT_SITE.announcement.visible,
      text: readString(announcement, "text", DEFAULT_SITE.announcement.text, 120, "announcement.text", errors, mode),
      linkLabel: readString(announcement, "linkLabel", DEFAULT_SITE.announcement.linkLabel, 80, "announcement.linkLabel", errors, mode),
      linkHref: linkHref && isSafeMenuHref(linkHref) ? linkHref : mode === "lenient" ? DEFAULT_SITE.announcement.linkHref : linkHref,
    },
    footer: {
      tagline: readString(footer, "tagline", DEFAULT_SITE.footer.tagline, 120, "footer.tagline", errors, mode),
      bottomText: readString(footer, "bottomText", DEFAULT_SITE.footer.bottomText, 120, "footer.bottomText", errors, mode),
    },
    headerCtaLabel: readString(source, "headerCtaLabel", DEFAULT_SITE.headerCtaLabel, 30, "headerCtaLabel", errors, mode, true),
    floatingLabel: readString(source, "floatingLabel", DEFAULT_SITE.floatingLabel, 30, "floatingLabel", errors, mode, true),
  };
}

function parsePageSeo(raw: unknown, fallback: PageSeo, prefix: string, errors: FieldErrors, mode: Mode): PageSeo {
  const source = asRecord(raw);
  const canonical = readString(source, "canonical", fallback.canonical, URL_MAX, `${prefix}.canonical`, errors, mode);
  const canonicalError = canonicalUrlError(canonical);
  if (canonicalError && mode === "strict") errors[`${prefix}.canonical`] = canonicalError;
  return {
    title: readString(source, "title", fallback.title, SEO_TITLE_MAX, `${prefix}.title`, errors, mode, true),
    description: readString(source, "description", fallback.description, SEO_DESCRIPTION_MAX, `${prefix}.description`, errors, mode, true),
    ogTitle: readString(source, "ogTitle", fallback.ogTitle, SEO_TITLE_MAX, `${prefix}.ogTitle`, errors, mode),
    ogDescription: readString(source, "ogDescription", fallback.ogDescription, OG_DESCRIPTION_MAX, `${prefix}.ogDescription`, errors, mode),
    ogImage: readImage(source, "ogImage", `${prefix}.ogImage`, errors, mode),
    canonical: canonicalError ? (mode === "lenient" ? "" : canonical) : canonical,
  };
}

function parseSeo(raw: unknown, errors: FieldErrors, mode: Mode): SeoSettings {
  const source = asRecord(raw);
  const pages = asRecord(source.pages);
  const canonicalOrigin = readString(source, "canonicalOrigin", "", URL_MAX, "canonicalOrigin", errors, mode);
  const originError = canonicalOriginError(canonicalOrigin);
  if (originError && mode === "strict") errors.canonicalOrigin = originError;
  return {
    canonicalOrigin: originError ? (mode === "lenient" ? "" : canonicalOrigin) : canonicalOrigin.replace(/\/+$/, ""),
    appendSiteName: typeof source.appendSiteName === "boolean" ? source.appendSiteName : DEFAULT_SEO.appendSiteName,
    defaultDescription: readString(source, "defaultDescription", DEFAULT_SEO.defaultDescription, SEO_DESCRIPTION_MAX, "defaultDescription", errors, mode, true),
    defaultOgImage: readImage(source, "defaultOgImage", "defaultOgImage", errors, mode),
    defaultOgImageAlt: readString(source, "defaultOgImageAlt", DEFAULT_SEO.defaultOgImageAlt, 160, "defaultOgImageAlt", errors, mode),
    favicon: readImage(source, "favicon", "favicon", errors, mode),
    pages: {
      home: parsePageSeo(pages.home, DEFAULT_SEO.pages.home, "pages.home", errors, mode),
      katalog: parsePageSeo(pages.katalog, DEFAULT_SEO.pages.katalog, "pages.katalog", errors, mode),
    },
  };
}

function toResult<T>(value: T, errors: FieldErrors): Result<T> {
  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, value };
}

/** Admin save. Field errors are keyed by path, e.g. "announcement.text". */
export function validateSiteIdentity(raw: unknown): Result<SiteIdentity> {
  const errors: FieldErrors = {};
  return toResult(parseSite(raw, errors, "strict"), errors);
}

/** Admin save. Field errors are keyed by path, e.g. "pages.home.canonical". */
export function validateSeoSettings(raw: unknown): Result<SeoSettings> {
  const errors: FieldErrors = {};
  return toResult(parseSeo(raw, errors, "strict"), errors);
}

/** File read: missing or broken values fall back to the defaults. */
export function normalizeSiteIdentity(raw: unknown): SiteIdentity {
  return raw === undefined ? DEFAULT_SITE : parseSite(raw, {}, "lenient");
}

export function normalizeSeoSettings(raw: unknown): SeoSettings {
  return raw === undefined ? DEFAULT_SEO : parseSeo(raw, {}, "lenient");
}

/** Uploaded files the settings use, for upload cleanup. */
export function settingsUploads(seo: SeoSettings): string[] {
  return [seo.defaultOgImage, seo.favicon, seo.pages.home.ogImage, seo.pages.katalog.ogImage]
    .map((image) => image?.file)
    .filter((file): file is string => Boolean(file));
}
