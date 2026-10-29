import { SeoSettingsForm } from "@/components/admin/seo-settings-form";
import { SiteIdentityForm } from "@/components/admin/site-identity-form";
import { requireAdmin } from "@/lib/auth/admin";
import { readSettings } from "@/lib/content/settings";
import { getSiteUrl } from "@/lib/site-url";

async function load() {
  try {
    return await readSettings();
  } catch (error) {
    console.error("[admin] Gagal membaca pengaturan:", error);
    return null;
  }
}

/** SITE_URL for the canonical domain hint; a malformed value is shown as unset. */
function siteUrl(): string | null {
  try {
    return getSiteUrl()?.origin ?? null;
  } catch {
    return null;
  }
}

export default async function AdminSitePage() {
  await requireAdmin();
  const settings = await load();

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1 className="admin-title">Situs &amp; SEO</h1>
          <p className="admin-subtitle">
            Nama situs, pengumuman, footer, dan tampilan link di Google, WhatsApp, dan Telegram.
          </p>
        </div>
      </header>

      {!settings ? (
        <p className="admin-banner admin-banner-error" role="alert">
          Gagal membaca pengaturan. Folder data di server tidak dapat diakses.
        </p>
      ) : (
        <>
          <SiteIdentityForm site={settings.site} />
          <SeoSettingsForm seo={settings.seo} siteName={settings.site.siteName} siteUrl={siteUrl()} />
        </>
      )}
    </>
  );
}
