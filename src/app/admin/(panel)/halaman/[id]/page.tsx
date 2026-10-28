import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { deletePageAction } from "@/app/admin/actions/pages";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageForm } from "@/components/admin/page-form";
import { requireAdmin } from "@/lib/auth/admin";
import { getPage } from "@/lib/content/pages";
import type { Page } from "@/lib/content/types";

async function load(id: string): Promise<{ page: Page | null } | null> {
  try {
    return { page: await getPage(id) };
  } catch (error) {
    console.error("[admin] Gagal membaca halaman:", error);
    return null;
  }
}

export default async function EditPagePage({
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
        Halaman tidak dapat dibaca. File datanya mungkin rusak atau folder data tidak dapat
        diakses.
      </p>
    );
  }
  const { page } = data;
  if (!page) notFound();

  return (
    <>
      <header className="admin-page-header">
        <div>
          <Link className="admin-back" href="/admin/halaman">
            ← Halaman
          </Link>
          <h1 className="admin-title">{page.title}</h1>
        </div>
        {page.status === "published" && (
          <a
            className="admin-button admin-button-secondary"
            href={`/${page.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={16} aria-hidden="true" /> Lihat di situs
          </a>
        )}
      </header>
      <PageForm
        key={page.id}
        page={page}
        notice={query.disimpan === "1" ? "Halaman berhasil disimpan." : undefined}
      />
      <section className="admin-card admin-section admin-danger-zone">
        <h2 className="admin-section-title">Hapus halaman</h2>
        <p className="admin-help">
          Halaman dihapus permanen. Gambar yang tidak dipakai produk atau halaman lain ikut
          dihapus.
        </p>
        <DeleteButton
          action={deletePageAction}
          id={page.id}
          confirmMessage="Hapus halaman? Tindakan ini tidak dapat dibatalkan."
          label="Hapus halaman"
        />
      </section>
    </>
  );
}
