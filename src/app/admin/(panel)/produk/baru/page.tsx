import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth/admin";
import { listCategories } from "@/lib/content/categories";
import type { Category } from "@/lib/content/types";

export default async function NewProductPage() {
  await requireAdmin();
  let categories: Category[] = [];
  let loadError = false;
  try {
    categories = await listCategories();
  } catch (error) {
    console.error("[admin] Gagal membaca kategori:", error);
    loadError = true;
  }

  return (
    <>
      <header className="admin-page-header">
        <div>
          <Link className="admin-back" href="/admin/produk">
            ← Produk
          </Link>
          <h1 className="admin-title">Tambah produk</h1>
        </div>
      </header>
      {loadError && (
        <p className="admin-banner admin-banner-warning" role="alert">
          Daftar kategori tidak dapat dibaca. Folder data di server mungkin bermasalah.
        </p>
      )}
      <ProductForm categories={categories} />
    </>
  );
}
