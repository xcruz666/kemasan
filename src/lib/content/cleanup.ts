import { deleteUnusedUploads } from "@/lib/uploads";
import { readLanding } from "./landing";
import { landingUploads } from "./landing-shared";
import { listPages } from "./pages";
import { listProducts } from "./products";
import { pageUploads, productUploads } from "./references";
import { readSettings } from "./settings";
import { settingsUploads, siteIdentityUploads } from "./settings-shared";

/** Delete candidate uploads that nothing (products, pages, landing, settings, logo) references any more. */
export async function cleanupUploads(candidates: string[]) {
  if (candidates.length === 0) return;
  try {
    const [products, pages, landing, settings] = await Promise.all([
      listProducts(),
      listPages(),
      readLanding(),
      readSettings(),
    ]);
    const used = new Set([
      ...products.items.flatMap(productUploads),
      ...pages.items.flatMap(pageUploads),
      ...landingUploads(landing),
      ...settingsUploads(settings.seo),
      ...siteIdentityUploads(settings.site),
    ]);
    await deleteUnusedUploads(candidates, used);
  } catch (error) {
    // Leftover files only waste disk space; never fail the save because of them.
    console.error("[content] Gagal membersihkan foto lama:", error);
  }
}
