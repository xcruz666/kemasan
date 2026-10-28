import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { deleteProductAction } from "@/app/admin/actions/products";
import { DeleteButton } from "@/components/admin/delete-button";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth/admin";
import { listCategories } from "@/lib/content/categories";
import { getProduct } from "@/lib/content/products";

async function load(id: string) {
  try {
    const [product, categories] = await Promise.all([getProduct(id), listCategories()]);
    return { product, categories };
  } catch (error) {
    console.error("[admin] Gagal membaca produk:", error);
    return null;
  }
}

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ disimpan?: string | string[] }>;
}) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const data = await load(id);

  if (!data) {
    return (
      <p className="admin-banner admin-banner-error" role="alert">
        Produk tidak dapat dibaca. File datanya mungkin rusak atau folder data tidak dapat diakses.
      </p>
    );
  }
  const { product, categories } = data;
  if (!product) notFound();

  return (
    <>
      <header className="admin-page-header">
        <div>
          <Link className="admin-back" href="/admin/produk">
            ← Produk
          </Link>
          <h1 className="admin-title">{product.name}</h1>
        </div>
        {product.status === "published" && (
          <a
            className="admin-button admin-button-secondary"
            href={`/katalog/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={16} aria-hidden="true" /> Lihat di situs
          </a>
        )}
      </header>
      <ProductForm
        key={product.id}
        product={product}
        categories={categories}
        notice={query.disimpan === "1" ? "Produk berhasil disimpan." : undefined}
      />
      <section className="admin-card admin-section admin-danger-zone">
        <h2 className="admin-section-title">Hapus produk</h2>
        <p className="admin-help">Produk dihapus permanen. Foto yang tidak dipakai produk atau halaman lain ikut dihapus.</p>
        <DeleteButton
          action={deleteProductAction}
          id={product.id}
          confirmMessage="Hapus produk? Tindakan ini tidak dapat dibatalkan."
          label="Hapus produk"
        />
      </section>
    </>
  );
}
