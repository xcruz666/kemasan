import { deleteUnusedUploads } from "@/lib/uploads";
import { listPages } from "./pages";
import { listProducts } from "./products";
import { pageUploads, productUploads } from "./references";

/** Delete candidate uploads that no product or page references any more. */
export async function cleanupUploads(candidates: string[]) {
  if (candidates.length === 0) return;
  try {
    const [products, pages] = await Promise.all([listProducts(), listPages()]);
    const used = new Set([
      ...products.items.flatMap(productUploads),
      ...pages.items.flatMap(pageUploads),
    ]);
    await deleteUnusedUploads(candidates, used);
  } catch (error) {
    // Leftover files only waste disk space; never fail the save because of them.
    console.error("[content] Gagal membersihkan foto lama:", error);
  }
}
