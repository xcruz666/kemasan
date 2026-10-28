import Link from "next/link";
import { Menu, Pencil, Plus } from "lucide-react";
import { formatDateTime } from "@/components/admin/format-date";
import { requireAdmin } from "@/lib/auth/admin";
import { listPages } from "@/lib/content/pages";

async function load() {
  try {
    return await listPages();
  } catch (error) {
    console.error("[admin] Gagal membaca halaman:", error);
    return null;
  }
}

export default async function AdminPagesPage() {
  await requireAdmin();
  const pages = await load();

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1 className="admin-title">Halaman</h1>
          <p className="admin-subtitle">Halaman tambahan seperti Tentang Kami atau Cara Pemesanan.</p>
        </div>
        <Link className="admin-button admin-button-primary" href="/admin/halaman/baru">
          <Plus size={16} aria-hidden="true" /> Tambah halaman
        </Link>
      </header>

      {!pages && (
        <p className="admin-banner admin-banner-error" role="alert">
          Gagal membaca data halaman. Folder data di server tidak dapat diakses.
        </p>
      )}
      {pages && pages.brokenFiles.length > 0 && (
        <p className="admin-banner admin-banner-warning" role="alert">
          File rusak dilewati: {pages.brokenFiles.join(", ")}
        </p>
      )}

      {pages && pages.items.length === 0 && (
        <div className="admin-card admin-empty">
          <p>Belum ada halaman.</p>
          <Link className="admin-button admin-button-primary" href="/admin/halaman/baru">
            <Plus size={16} aria-hidden="true" /> Tambah halaman
          </Link>
        </div>
      )}

      {pages && pages.items.length > 0 && (
        <div className="admin-card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Judul</th>
                <th scope="col">URL</th>
                <th scope="col">Status</th>
                <th scope="col">Diperbarui</th>
                <th scope="col">
                  <span className="admin-visually-hidden">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {pages.items.map((page) => (
                <tr key={page.id}>
                  <td data-label="Judul">
                    <Link className="admin-table-title" href={`/admin/halaman/${page.id}`}>
                      {page.title}
                    </Link>
                  </td>
                  <td data-label="URL">
                    <span className="admin-mono">/{page.slug}</span>
                  </td>
                  <td data-label="Status">
                    <span className="admin-badges">
                      <span
                        className={
                          page.status === "published"
                            ? "admin-badge admin-badge-published"
                            : "admin-badge admin-badge-draft"
                        }
                      >
                        {page.status === "published" ? "Terbit" : "Draf"}
                      </span>
                      {page.showInMenu && (
                        <span className="admin-badge admin-badge-featured">
                          <Menu size={12} aria-hidden="true" /> Menu #{page.menuOrder}
                        </span>
                      )}
                    </span>
                  </td>
                  <td data-label="Diperbarui">{formatDateTime(page.updatedAt)}</td>
                  <td className="admin-table-actions">
                    <Link
                      className="admin-button admin-button-secondary admin-button-small"
                      href={`/admin/halaman/${page.id}`}
                      aria-label={`Ubah ${page.title}`}
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
