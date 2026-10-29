import type { MetadataRoute } from "next";
import { getPublishedPages } from "@/lib/content/pages";
import { getPublishedProducts } from "@/lib/content/products";
import { getPublicOrigin } from "@/lib/content/settings";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = await getPublicOrigin();

  if (!siteUrl) return [];

  const [products, pages] = await Promise.all([
    getPublishedProducts(),
    getPublishedPages(),
  ]);

  return [
    { url: siteUrl.toString() },
    { url: new URL("/katalog", siteUrl).toString() },
    ...products.map((product) => ({
      url: new URL(`/katalog/${product.slug}`, siteUrl).toString(),
      lastModified: product.updatedAt,
    })),
    ...pages.map((page) => ({
      url: new URL(`/${page.slug}`, siteUrl).toString(),
      lastModified: page.updatedAt,
    })),
  ];
}
