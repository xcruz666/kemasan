import { redirect } from "next/navigation";
import { Layers2 } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { isAdmin } from "@/lib/auth/admin";
import { getAuthConfig } from "@/lib/auth/config";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const config = getAuthConfig();
  if (config && (await isAdmin())) redirect("/admin");

  return (
    <main className="admin-login">
      <div className="admin-card admin-login-card">
        <div className="admin-brand">
          <Layers2 size={26} strokeWidth={1.7} aria-hidden="true" />
          <span>Optima Admin</span>
        </div>
        <h1 className="admin-title">Masuk</h1>
        {config ? (
          <LoginForm />
        ) : (
          <p className="admin-banner admin-banner-warning" role="status">
            Admin belum dikonfigurasi. Isi ADMIN_PASSWORD_HASH dan SESSION_SECRET di environment
            aplikasi.
          </p>
        )}
      </div>
    </main>
  );
}
