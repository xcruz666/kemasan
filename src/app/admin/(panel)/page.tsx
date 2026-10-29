import Link from "next/link";
import { FileText, Package, Plus, Settings, Tags } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { listCategories } from "@/lib/content/categories";
import { checkDataDir } from "@/lib/content/data-dir";
import { listPages } from "@/lib/content/pages";
import { listProducts } from "@/lib/content/products";
import type { Status } from "@/lib/content/types";

type Counts = { published: number; draft: number; broken: number };

function count(items: { status: Status }[], broken: string[]): Counts {
  const published = items.filter((item) => item.status === "published").length;
  return { published, draft: items.length - published, broken: broken.length };
}

async function loadSummary() {
  try {
    const [products, pages, categories] = await Promise.all([
      listProducts(),
      listPages(),
      listCategories(),
    ]);
    return {
      products: count(products.items, products.brokenFiles),
      pages: count(pages.items, pages.brokenFiles),
      categories: categories.length,
    };
  } catch (error) {
    console.error("[admin] Gagal membaca ringkasan:", error);
    return null;
  }
}

function StatCard({
  title,
  href,
  counts,
}: {
  title: string;
  href: string;
  counts: Counts;
}) {
  return (
    <Link className="admin-card admin-stat" href={href}>
      <span className="admin-stat-label">{title}</span>
      <span className="admin-stat-value">{counts.published + counts.draft}</span>
      <span className="admin-muted">
        {counts.published} terbit · {counts.draft} draf
        {counts.broken > 0 && ` · ${counts.broken} file rusak`}
      </span>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  await requireAdmin();
  const [dataDir, summary] = await Promise.all([checkDataDir(), loadSummary()]);
  const production = process.env.NODE_ENV === "production";

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1 className="admin-title">Ringkasan</h1>
          <p className="admin-subtitle">Kelola produk katalog dan halaman tambahan situs.</p>
        </div>
      </header>

      {!dataDir.writable && (
        <p className="admin-banner admin-banner-error" role="alert">
          Folder data tidak dapat diakses: <code>{dataDir.path}</code>
        </p>
      )}
      {production && !dataDir.configured && (
        <p className="admin-banner admin-banner-warning" role="alert">
          DATA_DIR belum diisi. Data disimpan di <code>{dataDir.path}</code> di dalam folder
          aplikasi dan akan hilang saat deploy ulang. Isi DATA_DIR dengan folder di luar
          Application root.
        </p>
      )}

      {summary ? (
        <div className="admin-stats">
          <StatCard title="Produk" href="/admin/produk" counts={summary.products} />
          <StatCard title="Halaman" href="/admin/halaman" counts={summary.pages} />
          <Link className="admin-card admin-stat" href="/admin/kategori">
            <span className="admin-stat-label">Kategori</span>
            <span className="admin-stat-value">{summary.categories}</span>
            <span className="admin-muted">Kelompok produk di katalog</span>
          </Link>
        </div>
      ) : (
        <p className="admin-banner admin-banner-error" role="alert">
          Gagal membaca data. Periksa folder data di server.
        </p>
      )}

      <section className="admin-card admin-section">
        <h2 className="admin-section-title">Tautan cepat</h2>
        <div className="admin-quick-links">
          <Link className="admin-button admin-button-primary" href="/admin/produk/baru">
            <Plus size={16} aria-hidden="true" /> Tambah produk
          </Link>
          <Link className="admin-button admin-button-secondary" href="/admin/halaman/baru">
            <Plus size={16} aria-hidden="true" /> Tambah halaman
          </Link>
          <Link className="admin-button admin-button-secondary" href="/admin/produk">
            <Package size={16} aria-hidden="true" /> Daftar produk
          </Link>
          <Link className="admin-button admin-button-secondary" href="/admin/kategori">
            <Tags size={16} aria-hidden="true" /> Kategori
          </Link>
          <Link className="admin-button admin-button-secondary" href="/admin/halaman">
            <FileText size={16} aria-hidden="true" /> Daftar halaman
          </Link>
          <Link className="admin-button admin-button-secondary" href="/admin/pengaturan">
            <Settings size={16} aria-hidden="true" /> Pengaturan
          </Link>
        </div>
      </section>
    </>
  );
}
