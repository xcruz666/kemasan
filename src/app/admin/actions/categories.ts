"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createCategory, deleteCategory, updateCategory } from "@/lib/content/categories";
import { slugify } from "@/lib/content/slug";
import { validateCategoryInput } from "@/lib/content/validation";
import {
  type FormState,
  INVALID_FORM,
  SAVE_ERROR,
  failure,
  fieldFailure,
  readId,
  success,
} from "./form-state";

function readCategory(formData: FormData) {
  const name = formData.get("name");
  const slug = formData.get("slug");
  const nameText = typeof name === "string" ? name : "";
  const slugText = typeof slug === "string" ? slug.trim() : "";
  return validateCategoryInput({ name: nameText, slug: slugText || slugify(nameText) });
}

function revalidateCategories() {
  revalidatePath("/admin/kategori");
  revalidatePath("/admin/produk");
  revalidatePath("/");
  revalidatePath("/katalog", "layout");
}

export async function createCategoryAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const validated = readCategory(formData);
  if (!validated.ok) return fieldFailure(validated.errors);

  try {
    const result = await createCategory(validated.value);
    if (!result.ok) return fieldFailure(result.errors);
  } catch (error) {
    console.error("[admin] Gagal menambah kategori:", error);
    return failure(SAVE_ERROR);
  }

  revalidateCategories();
  return success("Kategori berhasil ditambahkan.");
}

export async function updateCategoryAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const id = readId(formData);
  if (!id) return failure(INVALID_FORM);
  const validated = readCategory(formData);
  if (!validated.ok) return fieldFailure(validated.errors);

  try {
    const result = await updateCategory(id, validated.value);
    if (!result.ok) return fieldFailure(result.errors);
  } catch (error) {
    console.error("[admin] Gagal menyimpan kategori:", error);
    return failure(SAVE_ERROR);
  }

  revalidateCategories();
  return success("Kategori berhasil disimpan.");
}

export async function deleteCategoryAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const id = readId(formData);
  if (!id) return failure(INVALID_FORM);

  try {
    const result = await deleteCategory(id);
    if (!result.ok) return fieldFailure(result.errors);
  } catch (error) {
    console.error("[admin] Gagal menghapus kategori:", error);
    return failure("Gagal menghapus. Folder data di server tidak dapat ditulis.");
  }

  revalidateCategories();
  return success("Kategori berhasil dihapus.");
}
