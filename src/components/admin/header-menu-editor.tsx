"use client";

import { type FormEvent, useActionState, useState } from "react";
import { ArrowDown, ArrowUp, FileText, Link2, X } from "lucide-react";
import { initialFormState } from "@/app/admin/actions/form-state";
import { saveHeaderMenuAction } from "@/app/admin/actions/settings";
import {
  DEFAULT_MENU_LINKS,
  MENU_LABEL_MAX,
  MENU_MAX_ITEMS,
  type MenuItem,
} from "@/lib/content/settings-shared";
import type { Status } from "@/lib/content/types";
import { FieldError, submitWithoutReset } from "./form-parts";
import { CardMessage } from "./whatsapp-settings-form";

/** Only what the picker needs, so page bodies are not sent to the browser. */
export type MenuPageOption = { id: string; title: string; status: Status };

/** crypto.randomUUID only exists on https or localhost; plain-http hosting needs a fallback. */
function newItemId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `item-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function defaultLink(item: MenuItem) {
  return DEFAULT_MENU_LINKS.find((link) => link.key === item.id);
}

export function HeaderMenuEditor({
  menu,
  pages,
}: {
  menu: MenuItem[];
  pages: MenuPageOption[];
}) {
  const [state, formAction, pending] = useActionState(saveHeaderMenuAction, initialFormState);
  const [items, setItems] = useState<MenuItem[]>(menu);
  // Row errors are keyed by index; remember which row sat at each index when saved
  // so errors stay on the right row if the admin reorders afterwards.
  const [submittedIds, setSubmittedIds] = useState<string[]>([]);
  const errors = state.errors;

  const pageTitle = (pageId: string) => pages.find((page) => page.id === pageId)?.title ?? "";
  const itemName = (item: MenuItem, index: number) => {
    if (item.kind === "default") return defaultLink(item)?.label ?? item.id;
    if (item.kind === "page") return item.label || pageTitle(item.pageId) || `item ${index + 1}`;
    return item.label || `link ${index + 1}`;
  };
  const rowError = (item: MenuItem) => {
    const index = submittedIds.indexOf(item.id);
    return index === -1 ? undefined : errors[`menu.${index}`];
  };

  function update(id: string, patch: Partial<MenuItem>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? ({ ...item, ...patch } as MenuItem) : item)),
    );
  }

  function move(index: number, offset: -1 | 1) {
    setItems((current) => {
      const target = index + offset;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function remove(id: string) {
    setItems((current) => current.filter((item) => item.id !== id || item.kind === "default"));
  }

  function addPage() {
    const first = pages[0];
    if (!first) return;
    setItems((current) => [
      ...current,
      { id: newItemId(), kind: "page", pageId: first.id, label: "", visible: true },
    ]);
  }

  function addLink() {
    setItems((current) => [
      ...current,
      { id: newItemId(), kind: "link", label: "", href: "", visible: true },
    ]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    setSubmittedIds(items.map((item) => item.id));
    submitWithoutReset(formAction)(event);
  }

  const full = items.length >= MENU_MAX_ITEMS;
  const payload = JSON.stringify(items);

  return (
    <form className="admin-card admin-section" onSubmit={handleSubmit}>
      <input type="hidden" name="payload" value={payload} />
      <div>
        <h2 className="admin-section-title">Menu header</h2>
        <p className="admin-help">
          Atur link di menu atas situs. Link bawaan bisa disembunyikan, tidak bisa dihapus.
        </p>
      </div>

      {errors.menu && (
        <p className="admin-banner admin-banner-error admin-banner-flush" role="alert">
          {errors.menu}
        </p>
      )}

      <ol className="admin-menu-list">
        {items.map((item, index) => {
          const prefix = `menu-${item.id}`;
          const name = itemName(item, index);
          const error = rowError(item);
          return (
            <li
              key={item.id}
              className={item.visible ? "admin-menu-row" : "admin-menu-row admin-menu-row-hidden"}
            >
              <div className="admin-menu-move">
                <button
                  type="button"
                  className="admin-icon-button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Naikkan ${name}`}
                >
                  <ArrowUp size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="admin-icon-button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label={`Turunkan ${name}`}
                >
                  <ArrowDown size={16} aria-hidden="true" />
                </button>
              </div>

              <div className="admin-menu-body">
                {item.kind === "default" && (
                  <div className="admin-menu-default">
                    <span className="admin-menu-default-label">
                      {defaultLink(item)?.label ?? item.id}
                      <span className="admin-badge admin-badge-draft">Bawaan</span>
                    </span>
                    <span className="admin-mono admin-menu-href">{defaultLink(item)?.href}</span>
                  </div>
                )}

                {item.kind === "page" && (
                  <PageRowFields
                    prefix={prefix}
                    item={item}
                    pages={pages}
                    invalid={Boolean(error)}
                    onChange={(patch) => update(item.id, patch)}
                  />
                )}

                {item.kind === "link" && (
                  <div className="admin-menu-fields">
                    <div className="admin-field">
                      <label className="admin-label-small" htmlFor={`${prefix}-label`}>
                        Label
                      </label>
                      <input
                        id={`${prefix}-label`}
                        className="admin-input"
                        value={item.label}
                        onChange={(event) => update(item.id, { label: event.target.value })}
                        maxLength={MENU_LABEL_MAX}
                        required
                        aria-invalid={Boolean(error) && !item.label.trim()}
                      />
                    </div>
                    <div className="admin-field">
                      <label className="admin-label-small" htmlFor={`${prefix}-href`}>
                        URL
                      </label>
                      <input
                        id={`${prefix}-href`}
                        className="admin-input"
                        value={item.href}
                        onChange={(event) => update(item.id, { href: event.target.value })}
                        placeholder="/katalog?kategori=… atau https://…"
                        maxLength={500}
                        required
                        autoComplete="off"
                        spellCheck={false}
                        aria-invalid={Boolean(error) && Boolean(item.label.trim())}
                        aria-describedby={`${prefix}-href-help`}
                      />
                      <p className="admin-help" id={`${prefix}-href-help`}>
                        Link https:// dibuka di tab baru.
                      </p>
                    </div>
                  </div>
                )}
                <FieldError id={`${prefix}-error`} message={error} />
              </div>

              <div className="admin-menu-side">
                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={item.visible}
                    onChange={(event) => update(item.id, { visible: event.target.checked })}
                  />
                  <span>
                    Tampil<span className="admin-visually-hidden"> {name}</span>
                  </span>
                </label>
                {item.kind !== "default" && (
                  <button
                    type="button"
                    className="admin-button admin-button-danger admin-button-small"
                    onClick={() => remove(item.id)}
                    aria-label={`Hapus ${name}`}
                  >
                    <X size={14} aria-hidden="true" /> Hapus
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="admin-menu-add">
        <button
          type="button"
          className="admin-button admin-button-secondary admin-button-small"
          onClick={addPage}
          disabled={full || pages.length === 0}
        >
          <FileText size={16} aria-hidden="true" /> Tambah halaman
        </button>
        <button
          type="button"
          className="admin-button admin-button-secondary admin-button-small"
          onClick={addLink}
          disabled={full}
        >
          <Link2 size={16} aria-hidden="true" /> Tambah link
        </button>
      </div>
      {full ? (
        <p className="admin-help">
          Menu sudah berisi {MENU_MAX_ITEMS} item, batas maksimal. Hapus item lain untuk
          menambah.
        </p>
      ) : (
        pages.length === 0 && (
          <p className="admin-help">Belum ada halaman. Buat halaman dulu di menu Halaman.</p>
        )
      )}

      <div className="admin-card-footer">
        <div className="admin-card-footer-message">
          <CardMessage state={state} />
        </div>
        <button type="submit" className="admin-button admin-button-primary" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
    </form>
  );
}

function PageRowFields({
  prefix,
  item,
  pages,
  invalid,
  onChange,
}: {
  prefix: string;
  item: Extract<MenuItem, { kind: "page" }>;
  pages: MenuPageOption[];
  invalid: boolean;
  onChange: (patch: { pageId?: string; label?: string }) => void;
}) {
  const selected = pages.find((page) => page.id === item.pageId);

  return (
    <div className="admin-menu-fields">
      <div className="admin-field">
        <label className="admin-label-small" htmlFor={`${prefix}-page`}>
          Halaman
        </label>
        <select
          id={`${prefix}-page`}
          className="admin-input"
          value={item.pageId}
          onChange={(event) => onChange({ pageId: event.target.value })}
          aria-invalid={invalid || !selected}
          aria-describedby={`${prefix}-page-help`}
        >
          {!selected && <option value={item.pageId}>(Halaman tidak ditemukan)</option>}
          {pages.map((page) => (
            <option key={page.id} value={page.id}>
              {page.status === "published" ? page.title : `${page.title} (draf)`}
            </option>
          ))}
        </select>
        <p className="admin-help" id={`${prefix}-page-help`}>
          {selected
            ? "Halaman draf tidak tampil di menu."
            : "Halaman ini sudah dihapus. Pilih halaman lain atau hapus item ini."}
        </p>
      </div>
      <div className="admin-field">
        <label className="admin-label-small" htmlFor={`${prefix}-label`}>
          Label (opsional)
        </label>
        <input
          id={`${prefix}-label`}
          className="admin-input"
          value={item.label}
          onChange={(event) => onChange({ label: event.target.value })}
          placeholder={selected?.title ?? ""}
          maxLength={MENU_LABEL_MAX}
        />
      </div>
    </div>
  );
}
