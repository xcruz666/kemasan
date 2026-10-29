/** Client-safe settings types, defaults, and validation. */
import type { FieldErrors, Result } from "./types";

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

export type SiteSettings = {
  whatsapp: WhatsappSettings;
  headerMenu: MenuItem[];
};

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
