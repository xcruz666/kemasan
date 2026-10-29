"use client";

import { useActionState, useState } from "react";
import { initialFormState } from "@/app/admin/actions/form-state";
import { saveSiteIdentityAction } from "@/app/admin/actions/site";
import { SITE_NAME_MAX, URL_MAX, type SiteIdentity } from "@/lib/content/settings-shared";
import { FieldError, submitWithoutReset } from "./form-parts";
import { CardMessage } from "./whatsapp-settings-form";

/* Client copies of the limits in validateSiteIdentity (settings-shared.ts). */
const ANNOUNCEMENT_TEXT_MAX = 120;
const ANNOUNCEMENT_LABEL_MAX = 80;
const FOOTER_TEXT_MAX = 120;
const BUTTON_LABEL_MAX = 30;

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  max: number;
  error?: string;
  help?: string;
  required?: boolean;
  multiline?: boolean;
  placeholder?: string;
};

function TextField({
  id,
  label,
  value,
  onChange,
  max,
  error,
  help,
  required,
  multiline,
  placeholder,
}: TextFieldProps) {
  const describedBy = [help ? `${id}-help` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ");
  const common = {
    id,
    className: multiline ? "admin-input admin-textarea" : "admin-input",
    value,
    maxLength: max,
    required,
    placeholder,
    "aria-invalid": Boolean(error),
    "aria-describedby": describedBy || undefined,
  };
  return (
    <div className="admin-field">
      <label className="admin-label" htmlFor={id}>
        {label}
      </label>
      {multiline ? (
        <textarea {...common} rows={3} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input {...common} onChange={(event) => onChange(event.target.value)} />
      )}
      {help && (
        <p className="admin-help" id={`${id}-help`}>
          {help}
        </p>
      )}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export function SiteIdentityForm({ site: initial }: { site: SiteIdentity }) {
  const [state, formAction, pending] = useActionState(saveSiteIdentityAction, initialFormState);
  const [site, setSite] = useState<SiteIdentity>(initial);
  const errors = state.errors;

  const set = (patch: Partial<SiteIdentity>) => setSite((current) => ({ ...current, ...patch }));
  const setAnnouncement = (patch: Partial<SiteIdentity["announcement"]>) =>
    setSite((current) => ({ ...current, announcement: { ...current.announcement, ...patch } }));
  const setFooter = (patch: Partial<SiteIdentity["footer"]>) =>
    setSite((current) => ({ ...current, footer: { ...current.footer, ...patch } }));

  return (
    <form className="admin-card admin-section" onSubmit={submitWithoutReset(formAction)}>
      <input type="hidden" name="payload" value={JSON.stringify(site)} />
      <div>
        <h2 className="admin-section-title">Identitas &amp; tampilan situs</h2>
        <p className="admin-help">
          Teks di sekitar setiap halaman. Logo dan navigasi footer tidak berubah.
        </p>
      </div>

      <TextField
        id="site-name"
        label="Nama situs"
        value={site.siteName}
        onChange={(siteName) => set({ siteName })}
        max={SITE_NAME_MAX}
        required
        error={errors.siteName}
        help="Tampil di preview link WhatsApp/Telegram, di akhir judul halaman, dan di copyright footer."
      />

      <fieldset className="admin-field admin-fieldset seo-group">
        <legend className="admin-label">Bar pengumuman</legend>
        <label className="admin-check">
          <input
            type="checkbox"
            checked={site.announcement.visible}
            onChange={(event) => setAnnouncement({ visible: event.target.checked })}
          />
          <span>Tampilkan bar pengumuman di atas header</span>
        </label>
        <TextField
          id="site-announcement-text"
          label="Teks"
          value={site.announcement.text}
          onChange={(text) => setAnnouncement({ text })}
          max={ANNOUNCEMENT_TEXT_MAX}
          error={errors["announcement.text"]}
        />
        <div className="admin-field-row">
          <TextField
            id="site-announcement-label"
            label="Label link"
            value={site.announcement.linkLabel}
            onChange={(linkLabel) => setAnnouncement({ linkLabel })}
            max={ANNOUNCEMENT_LABEL_MAX}
            error={errors["announcement.linkLabel"]}
            help="Kosongkan untuk menyembunyikan link."
          />
          <TextField
            id="site-announcement-href"
            label="URL link"
            value={site.announcement.linkHref}
            onChange={(linkHref) => setAnnouncement({ linkHref })}
            max={URL_MAX}
            error={errors["announcement.linkHref"]}
            placeholder="/#konsultasi atau https://…"
            help="Diawali / atau https://. Link https:// dibuka di tab baru."
          />
        </div>
      </fieldset>

      <fieldset className="admin-field admin-fieldset seo-group">
        <legend className="admin-label">Footer</legend>
        <TextField
          id="site-footer-tagline"
          label="Slogan"
          value={site.footer.tagline}
          onChange={(tagline) => setFooter({ tagline })}
          max={FOOTER_TEXT_MAX}
          multiline
          error={errors["footer.tagline"]}
          help="Tekan Enter untuk pindah baris."
        />
        <TextField
          id="site-footer-bottom"
          label="Teks bawah"
          value={site.footer.bottomText}
          onChange={(bottomText) => setFooter({ bottomText })}
          max={FOOTER_TEXT_MAX}
          error={errors["footer.bottomText"]}
          help="Tampil di samping copyright."
        />
      </fieldset>

      <div className="admin-field-row">
        <TextField
          id="site-header-cta"
          label="Label tombol di header"
          value={site.headerCtaLabel}
          onChange={(headerCtaLabel) => set({ headerCtaLabel })}
          max={BUTTON_LABEL_MAX}
          required
          error={errors.headerCtaLabel}
          help="Tombol WhatsApp di kanan atas. Bawaan: Hubungi kami."
        />
        <TextField
          id="site-floating-label"
          label="Label tombol mengambang"
          value={site.floatingLabel}
          onChange={(floatingLabel) => set({ floatingLabel })}
          max={BUTTON_LABEL_MAX}
          required
          error={errors.floatingLabel}
          help="Tombol WhatsApp di pojok kanan bawah. Bawaan: Chat kami."
        />
      </div>

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
