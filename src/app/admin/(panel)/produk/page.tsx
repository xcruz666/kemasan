import Link from "next/link";
import { Pencil, Plus, Star } from "lucide-react";
import { formatDateTime } from "@/components/admin/format-date";
import { requireAdmin } from "@/lib/auth/admin";
import { listCategories } from "@/lib/content/categories";
import { listProducts } from "@/lib/content/products";
import { priceLabel } from "@/lib/format";

async function load() {
  try {
    const [products, categories] = await Promise.all([listProducts(), listCategories()]);
    return { products, categories };
  } catch (error) {
    console.error("[admin] Gagal membaca produk:", error);
    return null;
  }
}

export default async function AdminProductsPage() {
  await requireAdmin();
  const data = await load();
  const categoryName = new Map(data?.categories.map((category) => [category.id, category.name]));

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1 className="admin-title">Produk</h1>
          <p className="admin-subtitle">Produk berstatus Terbit tampil di /katalog.</p>
        </div>
        <Link className="admin-button admin-button-primary" href="/admin/produk/baru">
          <Plus size={16} aria-hidden="true" /> Tambah produk
        </Link>
      </header>

      {!data && (
        <p className="admin-banner admin-banner-error" role="alert">
          Gagal membaca data produk. Folder data di server tidak dapat diakses.
        </p>
      )}
      {data && data.products.brokenFiles.length > 0 && (
        <p className="admin-banner admin-banner-warning" role="alert">
          File rusak dilewati: {data.products.brokenFiles.join(", ")}
        </p>
      )}

      {data && data.products.items.length === 0 && (
        <div className="admin-card admin-empty">
          <p>Belum ada produk.</p>
          <Link className="admin-button admin-button-primary" href="/admin/produk/baru">
            <Plus size={16} aria-hidden="true" /> Tambah produk
          </Link>
        </div>
      )}

      {data && data.products.items.length > 0 && (
        <div className="admin-card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Nama</th>
                <th scope="col">Kategori</th>
                <th scope="col">Harga</th>
                <th scope="col">Status</th>
                <th scope="col">Diperbarui</th>
                <th scope="col">
                  <span className="admin-visually-hidden">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.products.items.map((product) => (
                <tr key={product.id}>
                  <td data-label="Nama">
                    <Link className="admin-table-title" href={`/admin/produk/${product.id}`}>
                      {product.name}
                    </Link>
                    <span className="admin-muted admin-mono">/katalog/{product.slug}</span>
                  </td>
                  <td data-label="Kategori">
                    {(product.categoryId && categoryName.get(product.categoryId)) || "—"}
                  </td>
                  <td data-label="Harga">{priceLabel(product)}</td>
                  <td data-label="Status">
                    <span className="admin-badges">
                      <span
                        className={
                          product.status === "published"
                            ? "admin-badge admin-badge-published"
                            : "admin-badge admin-badge-draft"
                        }
                      >
                        {product.status === "published" ? "Terbit" : "Draf"}
                      </span>
                      {product.featured && (
                        <span className="admin-badge admin-badge-featured">
                          <Star size={12} aria-hidden="true" /> Unggulan
                        </span>
                      )}
                    </span>
                  </td>
                  <td data-label="Diperbarui">{formatDateTime(product.updatedAt)}</td>
                  <td className="admin-table-actions">
                    <Link
                      className="admin-button admin-button-secondary admin-button-small"
                      href={`/admin/produk/${product.id}`}
                      aria-label={`Ubah ${product.name}`}
                    >
                      <Pencil size={14} aria-hidden="true" /> Ubah
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
