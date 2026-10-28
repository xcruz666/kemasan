import { CategoryAddForm, CategoryRow } from "@/components/admin/category-rows";
import { requireAdmin } from "@/lib/auth/admin";
import { listCategories } from "@/lib/content/categories";
import { listProducts } from "@/lib/content/products";

async function load() {
  try {
    const [categories, products] = await Promise.all([listCategories(), listProducts()]);
    const usage = new Map<string, number>();
    for (const product of products.items) {
      if (product.categoryId) usage.set(product.categoryId, (usage.get(product.categoryId) ?? 0) + 1);
    }
    return { categories, usage };
  } catch (error) {
    console.error("[admin] Gagal membaca kategori:", error);
    return null;
  }
}

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const data = await load();

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1 className="admin-title">Kategori</h1>
          <p className="admin-subtitle">
            Kategori menjadi filter di /katalog. Kategori yang masih dipakai produk tidak dapat
            dihapus.
          </p>
        </div>
      </header>

      {!data ? (
        <p className="admin-banner admin-banner-error" role="alert">
          Gagal membaca kategori. Folder data di server tidak dapat diakses atau categories.json
          rusak.
        </p>
      ) : (
        <>
          <CategoryAddForm />
          {data.categories.length === 0 ? (
            <div className="admin-card admin-empty">
              <p>Belum ada kategori.</p>
            </div>
          ) : (
            <ul className="admin-category-list">
              {data.categories.map((category) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  usage={data.usage.get(category.id) ?? 0}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
