import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache } from "react";
import { JsonLd } from "@/components/json-ld";
import { MarkdownContent } from "@/components/markdown-content";
import { uploadUrl } from "@/lib/content/image-ref";
import { getPublishedPageBySlug } from "@/lib/content/pages";
import { markdownToPlainText } from "@/lib/markdown";
import { pageMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

// generateMetadata and the page run in the same request: read the data folder once.
const loadPage = cache(getPublishedPageBySlug);

function pageDescription(page: { seoDescription: string; body: string }) {
  return page.seoDescription || markdownToPlainText(page.body, 160);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadPage(slug);
  if (!page) return {};

  const cover = page.coverImage;
  return pageMetadata({
    title: page.seoTitle || page.title,
    description: pageDescription(page),
    path: `/${page.slug}`,
    image: cover
      ? {
          url: uploadUrl(cover.file),
          width: cover.width,
          height: cover.height,
          alt: cover.alt || page.title,
        }
      : undefined,
  });
}

export default async function ContentPage({ params }: Props) {
  const { slug } = await params;
  const page = await loadPage(slug);
  if (!page) notFound();

  const siteUrl = getSiteUrl();
  const cover = page.coverImage;

  return (
    <main id="main">
      {siteUrl && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": `${new URL(`/${page.slug}`, siteUrl).toString()}#webpage`,
            url: new URL(`/${page.slug}`, siteUrl).toString(),
            name: page.seoTitle || page.title,
            description: pageDescription(page),
            inLanguage: "id-ID",
            isPartOf: { "@id": `${siteUrl.toString()}#website` },
            ...(cover && {
              primaryImageOfPage: new URL(
                uploadUrl(cover.file),
                siteUrl,
              ).toString(),
            }),
            dateModified: page.updatedAt,
          }}
        />
      )}
      <article className="section container content-page">
        <header className="page-intro">
          <h1 className="page-title">{page.title}</h1>
        </header>
        {cover && (
          <Image
            className="content-cover"
            src={uploadUrl(cover.file)}
            alt={cover.alt || page.title}
            width={cover.width}
            height={cover.height}
            sizes="(max-width: 900px) 100vw, 860px"
            preload
            unoptimized
          />
        )}
        <MarkdownContent markdown={page.body} />
      </article>
    </main>
  );
}
