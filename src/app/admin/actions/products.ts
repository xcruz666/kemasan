"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { cleanupUploads } from "@/lib/content/cleanup";
import { deleteProduct, getProduct, saveProduct } from "@/lib/content/products";
import { productUploads } from "@/lib/content/references";
import type { Product } from "@/lib/content/types";
import { validateProductInput } from "@/lib/content/validation";
import {
  type FormState,
  INVALID_FORM,
  SAVE_ERROR,
  failure,
  fieldFailure,
  parsePayload,
  readId,
  success,
} from "./form-state";

function revalidateProduct(...products: (Product | null)[]) {
  revalidatePath("/admin");
  revalidatePath("/admin/produk");
  revalidatePath("/");
  revalidatePath("/katalog");
  revalidatePath("/sitemap.xml");
  for (const slug of new Set(products.map((product) => product?.slug))) {
    if (slug) revalidatePath(`/katalog/${slug}`);
  }
}

export async function saveProductAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const id = readId(formData);
  const raw = parsePayload(formData.get("payload"));
  if (raw === undefined) return failure(INVALID_FORM);

  const validated = validateProductInput(raw);
  if (!validated.ok) return fieldFailure(validated.errors);

  let previous: Product | null = null;
  let saved: Product;
  try {
    if (id) {
      previous = await getProduct(id);
      if (!previous) return failure("Produk tidak ditemukan. Mungkin sudah dihapus.");
    }
    const result = await saveProduct(validated.value, id);
    if (!result.ok) return fieldFailure(result.errors);
    saved = result.value;
  } catch (error) {
    console.error("[admin] Gagal menyimpan produk:", error);
    return failure(SAVE_ERROR);
  }

  if (previous) await cleanupUploads(productUploads(previous));
  revalidateProduct(saved, previous);
  revalidatePath(`/admin/produk/${saved.id}`);

  if (!id) redirect(`/admin/produk/${saved.id}?disimpan=1`);
  return success("Produk berhasil disimpan.");
}

export async function deleteProductAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const id = readId(formData);
  if (!id) return failure(INVALID_FORM);

  let deleted: Product | null;
  try {
    deleted = await deleteProduct(id);
  } catch (error) {
    console.error("[admin] Gagal menghapus produk:", error);
    return failure("Gagal menghapus. Folder data di server tidak dapat ditulis.");
  }
  if (!deleted) return failure("Produk tidak ditemukan. Mungkin sudah dihapus.");

  await cleanupUploads(productUploads(deleted));
  revalidateProduct(deleted);
  redirect("/admin/produk");
}
