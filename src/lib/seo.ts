import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site-url";

export type SeoImage = {
  /** Root-relative path, such as /uploads/<file> or /images/<file>. */
  url: string;
  width: number;
  height: number;
  alt: string;
};

export const defaultSocialImage: SeoImage = {
  url: "/images/optima-social.jpg",
  width: 1200,
  height: 630,
  alt: "Kantong vacuum premium berisi salmon dan sayuran",
};

type PageMetadataInput = {
  title: string;
  description: string;
  /** Root-relative path of the page, such as /katalog. */
  path: string;
  image?: SeoImage;
};

/**
 * Mirrors the root layout: canonical URL and social images are only emitted
 * when SITE_URL is set, because absolute URLs need a known origin.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
}: PageMetadataInput): Metadata {
  const siteUrl = getSiteUrl();
  const fullTitle = `${title} | ${brand.name}`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: brand.name,
      title: fullTitle,
      description,
    },
    twitter: { card: "summary", title: fullTitle, description },
  };

  if (!siteUrl) return metadata;

  const url = new URL(path, siteUrl).toString();
  const socialImage = image ?? defaultSocialImage;
  const imageUrl = new URL(socialImage.url, siteUrl).toString();

  return {
    ...metadata,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url,
      siteName: brand.name,
      title: fullTitle,
      description,
      images: [
        {
          url: imageUrl,
          width: socialImage.width,
          height: socialImage.height,
          alt: socialImage.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
    },
  };
}
