import { Layers2, LogOut } from "lucide-react";
import { logout } from "@/app/admin/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Layers2 size={24} strokeWidth={1.7} aria-hidden="true" />
          <span>Optima Admin</span>
        </div>
        <AdminNav />
        <form className="admin-logout" action={logout}>
          <button type="submit" className="admin-nav-link">
            <LogOut size={18} aria-hidden="true" />
            <span>Keluar</span>
          </button>
        </form>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
