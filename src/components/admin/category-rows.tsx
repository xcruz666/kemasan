"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/admin/actions/categories";
import { type FormState, initialFormState } from "@/app/admin/actions/form-state";
import { slugify } from "@/lib/content/slug";
import type { Category } from "@/lib/content/types";
import { DeleteButton } from "./delete-button";
import { FieldError, submitWithoutReset } from "./form-parts";

function RowMessage({ state }: { state: FormState }) {
  if (state.status === "idle") return null;
  const fieldMessages = Object.entries(state.errors)
    .filter(([key]) => key !== "form")
    .map(([, message]) => message);
  return (
    <div className="admin-row-message" aria-live="polite">
      <p className={state.status === "success" ? "admin-success" : "admin-error"}>
        {state.message}
      </p>
      {fieldMessages.map((message) => (
        <p className="admin-error" key={message}>
          {message}
        </p>
      ))}
    </div>
  );
}

export function CategoryRow({ category, usage }: { category: Category; usage: number }) {
  const [state, formAction, pending] = useActionState(updateCategoryAction, initialFormState);
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const prefix = `category-${category.id}`;

  return (
    <li className="admin-card admin-category-row">
      <form className="admin-category-form" onSubmit={submitWithoutReset(formAction)}>
        <input type="hidden" name="id" value={category.id} />
        <div className="admin-field">
          <label className="admin-label-small" htmlFor={`${prefix}-name`}>
            Nama
          </label>
          <input
            id={`${prefix}-name`}
            className="admin-input"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={60}
            required
            aria-invalid={Boolean(state.errors.name)}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label-small" htmlFor={`${prefix}-slug`}>
            Slug
          </label>
          <input
            id={`${prefix}-slug`}
            className="admin-input"
            name="slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            maxLength={80}
            required
            aria-invalid={Boolean(state.errors.slug)}
          />
        </div>
        <button
          type="submit"
          className="admin-button admin-button-primary admin-button-small"
          disabled={pending}
        >
          {pending ? "Menyimpan…" : "Simpan"}
        </button>
      </form>
      <div className="admin-category-side">
        <span className="admin-muted">
          {usage > 0 ? `Dipakai ${usage} produk` : "Belum dipakai produk"}
        </span>
        <DeleteButton
          action={deleteCategoryAction}
          id={category.id}
          confirmMessage="Hapus kategori? Tindakan ini tidak dapat dibatalkan."
          small
        />
      </div>
      <RowMessage state={state} />
    </li>
  );
}

export function CategoryAddForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (previous: FormState, formData: FormData) => {
      const result = await createCategoryAction(previous, formData);
      if (result.status === "success") {
        setName("");
        setSlug("");
        setSlugEdited(false);
      }
      return result;
    },
    initialFormState,
  );

  return (
    <form className="admin-card admin-section" onSubmit={submitWithoutReset(formAction)}>
      <h2 className="admin-section-title">Tambah kategori</h2>
      <div className="admin-category-form">
        <div className="admin-field">
          <label className="admin-label-small" htmlFor="category-new-name">
            Nama
          </label>
          <input
            id="category-new-name"
            className="admin-input"
            name="name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (!slugEdited) setSlug(slugify(event.target.value));
            }}
            maxLength={60}
            required
            aria-invalid={Boolean(state.errors.name)}
            aria-describedby={state.errors.name ? "category-new-name-error" : undefined}
          />
          <FieldError id="category-new-name-error" message={state.errors.name} />
        </div>
        <div className="admin-field">
          <label className="admin-label-small" htmlFor="category-new-slug">
            Slug
          </label>
          <input
            id="category-new-slug"
            className="admin-input"
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlug(event.target.value);
              setSlugEdited(event.target.value !== "");
            }}
            maxLength={80}
            aria-invalid={Boolean(state.errors.slug)}
            aria-describedby={state.errors.slug ? "category-new-slug-error" : undefined}
          />
          <FieldError id="category-new-slug-error" message={state.errors.slug} />
        </div>
        <button
          type="submit"
          className="admin-button admin-button-primary admin-button-small"
          disabled={pending}
        >
          <Plus size={16} aria-hidden="true" /> {pending ? "Menyimpan…" : "Tambah kategori"}
        </button>
      </div>
      {state.status !== "idle" && (
        <p
          className={state.status === "success" ? "admin-success" : "admin-error"}
          role={state.status === "success" ? "status" : "alert"}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
