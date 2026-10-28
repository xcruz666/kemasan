import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { getCategoriesSafe } from "@/lib/content/categories";
import { getPublishedProducts } from "@/lib/content/products";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Katalog Kantong Vacuum",
    description:
      "Katalog kantong vacuum Optima Kemasan Prima untuk usaha dan grosir. Lihat ukuran, spesifikasi, dan harga, lalu konsultasikan kebutuhan Anda via WhatsApp.",
    // Filtered views share one canonical URL, so ?kategori= is never indexed separately.
    path: "/katalog",
  });
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string | string[] }>;
}) {
  const { kategori } = await searchParams;
  const requestedSlug = Array.isArray(kategori) ? kategori[0] : kategori;
  const [products, categories] = await Promise.all([
    getPublishedProducts(),
    getCategoriesSafe(),
  ]);

  const usedCategories = categories.filter((category) =>
    products.some((product) => product.categoryId === category.id),
  );
  const activeCategory = usedCategories.find(
    (category) => category.slug === requestedSlug,
  );
  const visibleProducts = activeCategory
    ? products.filter((product) => product.categoryId === activeCategory.id)
    : products;

  return (
    <main id="main">
      <section className="section container catalog-page">
        <header className="page-intro">
          <p className="eyebrow">KATALOG PRODUK</p>
          <h1 className="page-title">Katalog kantong vacuum</h1>
          <p className="page-lead">
            Pilih kemasan yang sesuai dengan produk Anda. Untuk ukuran atau
            ketebalan khusus, hubungi kami melalui WhatsApp.
          </p>
        </header>

        {usedCategories.length > 0 && (
          <nav className="catalog-filter" aria-label="Filter kategori">
            <Link
              className="catalog-chip"
              href="/katalog"
              aria-current={activeCategory ? undefined : "page"}
            >
              Semua
            </Link>
            {usedCategories.map((category) => (
              <Link
                key={category.id}
                className="catalog-chip"
                href={`/katalog?kategori=${encodeURIComponent(category.slug)}`}
                aria-current={
                  activeCategory?.id === category.id ? "page" : undefined
                }
              >
                {category.name}
              </Link>
            ))}
          </nav>
        )}

        {visibleProducts.length > 0 ? (
          <div className="product-card-grid">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                headingLevel="h2"
              />
            ))}
          </div>
        ) : (
          <p className="empty-state">Belum ada produk.</p>
        )}
      </section>
    </main>
  );
}
