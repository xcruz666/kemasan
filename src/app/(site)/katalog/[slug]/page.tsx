import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ChevronRight, Package } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { MarkdownContent } from "@/components/markdown-content";
import { ProductCard } from "@/components/product-card";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { brand, whatsappUrl } from "@/lib/brand";
import { getCategoriesSafe } from "@/lib/content/categories";
import { getSiteSettings } from "@/lib/content/settings";
import { uploadUrl } from "@/lib/content/image-ref";
import type { Product } from "@/lib/content/types";
import {
  getPublishedProductBySlug,
  getPublishedProducts,
} from "@/lib/content/products";
import { priceLabel } from "@/lib/format";
import { markdownToPlainText } from "@/lib/markdown";
import { pageMetadata } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

// generateMetadata and the page run in the same request: read the data folder once.
const loadProduct = cache(getPublishedProductBySlug);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return {};

  const image = product.images[0];
  return pageMetadata({
    title: product.seoTitle || product.name,
    description:
      product.seoDescription ||
      product.summary ||
      markdownToPlainText(product.description, 160),
    path: `/katalog/${product.slug}`,
    image: image && {
      url: uploadUrl(image.file),
      width: image.width,
      height: image.height,
      alt: image.alt || product.name,
    },
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();

  const [products, categories, { whatsapp }] = await Promise.all([
    getPublishedProducts(),
    getCategoriesSafe(),
    getSiteSettings(),
  ]);
  const category = categories.find((item) => item.id === product.categoryId);
  const related = product.categoryId
    ? products
        .filter(
          (item) =>
            item.categoryId === product.categoryId && item.id !== product.id,
        )
        .slice(0, 3)
    : [];
  const [mainImage, ...otherImages] = product.images;
  const siteUrl = getSiteUrl();

  return (
    <main id="main">
      {siteUrl && (
        <JsonLd data={productJsonLd(siteUrl, product, category?.name)} />
      )}
      <div className="container product-page">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li>
              <Link href="/">Beranda</Link>
              <ChevronRight size={14} aria-hidden="true" />
            </li>
            <li>
              <Link href="/katalog">Katalog</Link>
              <ChevronRight size={14} aria-hidden="true" />
            </li>
            <li>
              <span aria-current="page">{product.name}</span>
            </li>
          </ol>
        </nav>

        <div className="product-layout">
          <div className="product-gallery">
            {mainImage ? (
              <Image
                className="product-gallery-main"
                src={uploadUrl(mainImage.file)}
                alt={mainImage.alt || product.name}
                width={mainImage.width}
                height={mainImage.height}
                sizes="(max-width: 900px) 100vw, 50vw"
                preload
                unoptimized
              />
            ) : (
              <div className="product-gallery-placeholder" aria-hidden="true">
                <Package size={56} strokeWidth={1.1} />
              </div>
            )}
            {otherImages.length > 0 && (
              <ul className="product-gallery-thumbs">
                {otherImages.map((image) => (
                  <li key={image.file}>
                    <Image
                      src={uploadUrl(image.file)}
                      alt={image.alt || product.name}
                      width={image.width}
                      height={image.height}
                      sizes="(max-width: 900px) 33vw, 16vw"
                      unoptimized
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="product-info">
            {category && (
              <p className="eyebrow product-category">
                {category.name.toUpperCase()}
              </p>
            )}
            <h1 className="page-title product-title">{product.name}</h1>
            <p className="product-price">{priceLabel(product)}</p>
            {product.summary && (
              <p className="product-summary">{product.summary}</p>
            )}
            {product.specs.length > 0 && (
              <dl className="spec-list product-specs">
                {product.specs.map((spec, index) => (
                  <div key={`${spec.label}-${index}`}>
                    <dt>{spec.label}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <a
              className="button product-cta"
              href={whatsappUrl(
                whatsapp.phone,
                `Halo ${brand.name}, saya tertarik dengan produk ${product.name}. Mohon informasi harga, minimum pemesanan, dan ketersediaannya.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon /> Tanya via WhatsApp
            </a>
          </div>
        </div>

        {product.description.trim() && (
          <section
            className="product-description"
            aria-labelledby="deskripsi-produk"
          >
            <h2 id="deskripsi-produk" className="eyebrow">
              DESKRIPSI PRODUK
            </h2>
            <MarkdownContent markdown={product.description} />
          </section>
        )}

        {related.length > 0 && (
          <section className="related-products" aria-labelledby="produk-terkait">
            <h2 id="produk-terkait" className="related-title">
              Produk lain di kategori ini
            </h2>
            <div className="product-card-grid">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function productJsonLd(
  siteUrl: URL,
  product: Product,
  categoryName: string | undefined,
) {
  const url = new URL(`/katalog/${product.slug}`, siteUrl).toString();
  const images = product.images.map((image) =>
    new URL(uploadUrl(image.file), siteUrl).toString(),
  );

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${url}#product`,
        name: product.name,
        description:
          product.summary || markdownToPlainText(product.description, 300),
        url,
        ...(images.length > 0 && { image: images }),
        brand: { "@type": "Brand", name: brand.name },
        ...(categoryName && { category: categoryName }),
        // Only real data: no invented availability, ratings, or reviews.
        ...(product.price !== null && {
          offers: {
            "@type": "Offer",
            priceCurrency: "IDR",
            price: product.price,
            url,
          },
        }),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Beranda",
            item: siteUrl.toString(),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Katalog",
            item: new URL("/katalog", siteUrl).toString(),
          },
          { "@type": "ListItem", position: 3, name: product.name, item: url },
        ],
      },
    ],
  };
}
