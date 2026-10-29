import { HeaderMenuEditor, type MenuPageOption } from "@/components/admin/header-menu-editor";
import { WhatsappSettingsForm } from "@/components/admin/whatsapp-settings-form";
import { requireAdmin } from "@/lib/auth/admin";
import { listPages } from "@/lib/content/pages";
import { readSettings } from "@/lib/content/settings";

async function load() {
  try {
    const [settings, pages] = await Promise.all([readSettings(), listPages()]);
    const pageOptions: MenuPageOption[] = pages.items.map((page) => ({
      id: page.id,
      title: page.title,
      status: page.status,
    }));
    return { settings, pageOptions };
  } catch (error) {
    console.error("[admin] Gagal membaca pengaturan:", error);
    return null;
  }
}

export default async function AdminSettingsPage() {
  await requireAdmin();
  const data = await load();

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1 className="admin-title">Pengaturan</h1>
          <p className="admin-subtitle">Nomor WhatsApp dan menu header situs.</p>
        </div>
      </header>

      {!data ? (
        <p className="admin-banner admin-banner-error" role="alert">
          Gagal membaca pengaturan. Folder data di server tidak dapat diakses.
        </p>
      ) : (
        <>
          <WhatsappSettingsForm whatsapp={data.settings.whatsapp} />
          <HeaderMenuEditor menu={data.settings.headerMenu} pages={data.pageOptions} />
        </>
      )}
    </>
  );
}
