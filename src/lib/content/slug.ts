/** Client-safe slug helpers. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MAX_LENGTH = 80;

/** Top-level paths a page slug must not take over. */
export const RESERVED_PAGE_SLUGS = new Set([
  "admin",
  "katalog",
  "uploads",
  "api",
  "images",
  "fonts",
  "_next",
]);

export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/^-+|-+$/g, "");
}
