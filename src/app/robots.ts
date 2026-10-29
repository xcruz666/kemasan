import type { MetadataRoute } from "next";
import { getPublicOrigin } from "@/lib/content/settings";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = await getPublicOrigin();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    ...(siteUrl && { sitemap: new URL("/sitemap.xml", siteUrl).toString() }),
  };
}
