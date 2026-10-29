import type { Metadata } from "next";
import { uploadUrl } from "@/lib/content/image-ref";
import { getPublicOrigin, getSiteSettings } from "@/lib/content/settings";
import { DEFAULT_OG_IMAGE, type PageSeo } from "@/lib/content/settings-shared";
import type { ImageRef } from "@/lib/content/types";

export type SeoImage = {
  /** Root-relative path, such as /uploads/<file> or /images/<file>. */
  url: string;
  width: number;
  height: number;
  alt: string;
};

export function imageRefToSeo(image: ImageRef, fallbackAlt: string): SeoImage {
  return {
    url: uploadUrl(image.file),
    width: image.width,
    height: image.height,
    alt: image.alt || fallbackAlt,
  };
}

type PageMetadataInput = {
  title: string;
  /** Empty uses the default description from Situs & SEO. */
  description: string;
  /** Root-relative path of the page, such as /katalog. */
  path: string;
  /** Link preview image; undefined uses the default preview image. */
  image?: SeoImage;
  /** Link preview title and description when they should differ from the page's. */
  ogTitle?: string;
  ogDescription?: string;
  /** Absolute canonical URL from the admin; empty uses origin + path. */
  canonical?: string;
};

/** Page title as shown in the browser tab and search results. */
export async function fullTitle(title: string): Promise<string> {
  const { site, seo } = await getSiteSettings();
  return seo.appendSiteName && title !== site.siteName ? `${title} | ${site.siteName}` : title;
}

export async function defaultSocialImage(): Promise<SeoImage> {
  const { seo } = await getSiteSettings();
  return seo.defaultOgImage
    ? imageRefToSeo(seo.defaultOgImage, seo.defaultOgImageAlt)
    : { ...DEFAULT_OG_IMAGE, alt: seo.defaultOgImageAlt || DEFAULT_OG_IMAGE.alt };
}

/**
 * Canonical URL and absolute image URLs are only emitted when an origin is
 * known (canonical domain in Situs & SEO, or SITE_URL).
 */
export async function pageMetadata({
  title,
  description,
  path,
  image,
  ogTitle,
  ogDescription,
  canonical,
}: PageMetadataInput): Promise<Metadata> {
  const [{ site, seo }, origin] = await Promise.all([getSiteSettings(), getPublicOrigin()]);
  const pageTitle = await fullTitle(title);
  const pageDescription = description || seo.defaultDescription;
  const shareTitle = ogTitle || pageTitle;
  const shareDescription = ogDescription || pageDescription;

  const metadata: Metadata = {
    title: { absolute: pageTitle },
    description: pageDescription,
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: site.siteName,
      title: shareTitle,
      description: shareDescription,
    },
    twitter: { card: "summary", title: shareTitle, description: shareDescription },
  };

  if (!origin) return metadata;

  const url = canonical || new URL(path, origin).toString();
  const socialImage = image ?? (await defaultSocialImage());
  const imageUrl = new URL(socialImage.url, origin).toString();

  return {
    ...metadata,
    alternates: { canonical: url },
    openGraph: {
      ...metadata.openGraph,
      url,
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
      title: shareTitle,
      description: shareDescription,
      images: [imageUrl],
    },
  };
}

/** Beranda and Katalog: everything comes from Situs & SEO. */
export async function builtInPageMetadata(
  key: "home" | "katalog",
  path: string,
): Promise<Metadata> {
  const { seo } = await getSiteSettings();
  const page: PageSeo = seo.pages[key];
  return pageMetadata({
    title: page.title,
    description: page.description,
    path,
    image: page.ogImage ? imageRefToSeo(page.ogImage, page.title) : undefined,
    ogTitle: page.ogTitle,
    ogDescription: page.ogDescription,
    canonical: page.canonical,
  });
}
