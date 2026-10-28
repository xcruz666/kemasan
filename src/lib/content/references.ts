import type { Page, Product } from "./types";

const MARKDOWN_UPLOAD =
  /\/uploads\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:jpg|png|webp))/g;

export function markdownUploads(markdown: string): string[] {
  return [...markdown.matchAll(MARKDOWN_UPLOAD)].map((match) => match[1]);
}

export function productUploads(product: Product): string[] {
  return [...product.images.map((image) => image.file), ...markdownUploads(product.description)];
}

export function pageUploads(page: Page): string[] {
  return [
    ...(page.coverImage ? [page.coverImage.file] : []),
    ...markdownUploads(page.body),
  ];
}
