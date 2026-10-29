"use client";

import { type ReactNode, createContext, useContext } from "react";
import Link from "next/link";
import { ICON_OPTIONS, type IconKey, landingMaxLength } from "@/lib/content/landing-shared";
import type { FieldErrors } from "@/lib/content/types";
import { Counter, FieldError } from "./form-parts";

/** Field errors from the last save, keyed by path such as "faq.items.2.answer". */
export const LandingErrors = createContext<FieldErrors>({});

export const HEADING_HINT = "Tekan Enter untuk pindah baris (sama seperti desain sekarang).";

/** "hero.footnotes.0" → "landing-hero-footnotes-0" */
export function fieldId(path: string) {
  return `landing-${path.replace(/\./g, "-")}`;
}

/** True when the error map has an entry for this path or anything below it. */
export function hasErrorUnder(errors: FieldErrors, path: string) {
  return Object.keys(errors).some((key) => key === path || key.startsWith(`${path}.`));
}

export function TextField({
  path,
  id = fieldId(path),
  label,
  value,
  onChange,
  kind = "input",
  rows,
  help,
  placeholder,
  required,
  error,
}: {
  /** Content path; used for the id, the length limit, and the error lookup. */
  path: string;
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** heading: textarea with the line-break hint. text: plain textarea. */
  kind?: "input" | "heading" | "text";
  rows?: number;
  help?: ReactNode;
  placeholder?: string;
  required?: boolean;
  /** Overrides the lookup by path, for rows that can be reordered. */
  error?: string;
}) {
  const errors = useContext(LandingErrors);
  const message = error ?? errors[path];
  const max = landingMaxLength(path);
  const hint = kind === "heading" ? HEADING_HINT : help;
  const describedBy = [hint ? `${id}-help` : "", message ? `${id}-error` : ""]
    .filter(Boolean)
    .join(" ");
  const shared = {
    id,
    className: kind === "input" ? "admin-input" : "admin-input admin-textarea",
    value,
    maxLength: max,
    placeholder,
    required,
    "aria-invalid": Boolean(message),
    "aria-describedby": describedBy || undefined,
  };

  return (
    <div className="admin-field">
      <div className="admin-label-row">
        <label className="admin-label" htmlFor={id}>
          {label}
        </label>
        {kind !== "input" && <Counter value={value} max={max} />}
      </div>
      {kind === "input" ? (
        <input {...shared} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <textarea
          {...shared}
          rows={rows ?? (kind === "heading" ? 2 : 3)}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {hint && (
        <p className="admin-help" id={`${id}-help`}>
          {hint}
        </p>
      )}
      <FieldError id={`${id}-error`} message={message} />
    </div>
  );
}

export function IconField({
  path,
  value,
  onChange,
}: {
  path: string;
  value: IconKey;
  onChange: (value: IconKey) => void;
}) {
  const errors = useContext(LandingErrors);
  const id = fieldId(path);
  return (
    <div className="admin-field">
      <label className="admin-label" htmlFor={id}>
        Ikon
      </label>
      <select
        id={id}
        className="admin-input"
        value={value}
        onChange={(event) => onChange(event.target.value as IconKey)}
        aria-invalid={Boolean(errors[path])}
      >
        {ICON_OPTIONS.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError id={`${id}-error`} message={errors[path]} />
    </div>
  );
}

/** "Tampilkan bagian ini" plus what breaks when the section is hidden. */
export function VisibleField({
  path,
  checked,
  onChange,
  menuLabel,
  note,
}: {
  path: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  /** Default header menu link that points at this section. */
  menuLabel?: string;
  note?: ReactNode;
}) {
  const id = fieldId(path);
  const warn = !checked && (menuLabel || note);
  return (
    <div className="landing-visible">
      <label className="admin-check" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span>Tampilkan bagian ini</span>
      </label>
      {(menuLabel || note) && (
        <p className={warn ? "admin-warning-text" : "admin-help"}>
          {menuLabel && (
            <>
              Menu header “{menuLabel}” mengarah ke bagian ini. Jika bagian ini disembunyikan,
              sembunyikan juga menunya di{" "}
              <Link className="admin-link" href="/admin/pengaturan">
                Pengaturan → Menu header
              </Link>
              .{note && " "}
            </>
          )}
          {note}
        </p>
      )}
    </div>
  );
}

/** One collapsible block per landing section, in page order. */
export function LandingSection({
  path,
  title,
  hidden,
  children,
}: {
  path: string;
  title: string;
  hidden?: boolean;
  children: ReactNode;
}) {
  const errors = useContext(LandingErrors);
  const invalid = hasErrorUnder(errors, path);
  return (
    <details className="admin-card admin-section admin-details landing-section" data-section={path}>
      <summary className="admin-section-title">
        {title}
        {hidden && <span className="admin-badge admin-badge-draft">Disembunyikan</span>}
        {invalid && <span className="admin-badge landing-badge-error">Periksa isian</span>}
      </summary>
      {children}
    </details>
  );
}

/** A card, step, or row inside a section. */
export function LandingItem({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="admin-fieldset landing-item">
      <legend className="landing-item-title">{title}</legend>
      {children}
    </fieldset>
  );
}

export function GroupTitle({ children }: { children: ReactNode }) {
  return <h3 className="landing-group-title">{children}</h3>;
}
