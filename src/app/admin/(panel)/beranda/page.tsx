import { LandingForm } from "@/components/admin/landing-form";
import { requireAdmin } from "@/lib/auth/admin";
import { readLanding } from "@/lib/content/landing";

async function load() {
  try {
    return await readLanding();
  } catch (error) {
    console.error("[admin] Gagal membaca isi halaman utama:", error);
    return null;
  }
}

export default async function AdminLandingPage() {
  await requireAdmin();
  const landing = await load();

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1 className="admin-title">Halaman Utama</h1>
          <p className="admin-subtitle">
            Teks, foto, dan pesan WhatsApp di halaman utama. Tata letak dan warna tetap sesuai
            desain.
          </p>
        </div>
      </header>

      {!landing ? (
        <p className="admin-banner admin-banner-error" role="alert">
          Gagal membaca isi halaman utama. Folder data di server tidak dapat diakses.
        </p>
      ) : (
        <LandingForm landing={landing} />
      )}
    </>
  );
}
