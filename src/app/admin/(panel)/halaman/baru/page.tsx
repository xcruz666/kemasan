import Link from "next/link";
import { PageForm } from "@/components/admin/page-form";
import { requireAdmin } from "@/lib/auth/admin";

export default async function NewPagePage() {
  await requireAdmin();

  return (
    <>
      <header className="admin-page-header">
        <div>
          <Link className="admin-back" href="/admin/halaman">
            ← Halaman
          </Link>
          <h1 className="admin-title">Tambah halaman</h1>
        </div>
      </header>
      <PageForm />
    </>
  );
}
