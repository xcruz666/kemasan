"use client";

import { useActionState, useState } from "react";
import { ExternalLink } from "lucide-react";
import { type FormState, initialFormState } from "@/app/admin/actions/form-state";
import { saveWhatsappAction } from "@/app/admin/actions/settings";
import {
  WHATSAPP_MESSAGE_MAX,
  type WhatsappSettings,
  formatWhatsappDisplay,
  normalizeWhatsappPhone,
} from "@/lib/content/settings-shared";
import { Counter, FieldError, submitWithoutReset } from "./form-parts";

export function CardMessage({ state }: { state: FormState }) {
  if (state.status === "idle") return null;
  return (
    <p
      className={state.status === "success" ? "admin-success" : "admin-error"}
      role={state.status === "success" ? "status" : "alert"}
    >
      {state.message}
    </p>
  );
}

export function WhatsappSettingsForm({ whatsapp }: { whatsapp: WhatsappSettings }) {
  const [phone, setPhone] = useState(formatWhatsappDisplay(whatsapp.phone));
  const [defaultMessage, setDefaultMessage] = useState(whatsapp.defaultMessage);
  const [state, formAction, pending] = useActionState(
    async (previous: FormState, formData: FormData) => {
      const result = await saveWhatsappAction(previous, formData);
      if (result.status === "success") {
        // Show the number the way it was stored.
        const normalized = normalizeWhatsappPhone(String(formData.get("phone") ?? ""));
        if (normalized) setPhone(formatWhatsappDisplay(normalized));
      }
      return result;
    },
    initialFormState,
  );
  const errors = state.errors;

  const normalized = normalizeWhatsappPhone(phone);
  const testUrl = normalized
    ? `https://wa.me/${normalized}?text=${encodeURIComponent(defaultMessage.trim())}`
    : null;

  return (
    <form className="admin-card admin-section" onSubmit={submitWithoutReset(formAction)}>
      <h2 className="admin-section-title">WhatsApp</h2>

      <div className="admin-field">
        <label className="admin-label" htmlFor="whatsapp-phone">
          Nomor WhatsApp
        </label>
        <input
          id="whatsapp-phone"
          className="admin-input"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          maxLength={30}
          required
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={[
            "whatsapp-phone-help",
            "whatsapp-phone-preview",
            errors.phone ? "whatsapp-phone-error" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
        <p className="admin-help" id="whatsapp-phone-help">
          Boleh ditulis 0812-2220-195 atau +62 812 2220 195.
        </p>
        <p
          id="whatsapp-phone-preview"
          className={normalized ? "admin-help" : "admin-warning-text"}
          aria-live="polite"
        >
          {normalized ? (
            <>
              Disimpan sebagai <span className="admin-mono">wa.me/{normalized}</span>
            </>
          ) : (
            "Nomor belum valid. Gunakan nomor Indonesia, contoh: 0812-2220-195."
          )}
        </p>
        <FieldError id="whatsapp-phone-error" message={errors.phone} />
      </div>

      <div className="admin-field">
        <div className="admin-label-row">
          <label className="admin-label" htmlFor="whatsapp-message">
            Pesan pembuka
          </label>
          <Counter value={defaultMessage} max={WHATSAPP_MESSAGE_MAX} />
        </div>
        <textarea
          id="whatsapp-message"
          className="admin-input admin-textarea"
          name="defaultMessage"
          value={defaultMessage}
          onChange={(event) => setDefaultMessage(event.target.value)}
          rows={4}
          maxLength={WHATSAPP_MESSAGE_MAX}
          required
          aria-invalid={Boolean(errors.defaultMessage)}
          aria-describedby={[
            "whatsapp-message-help",
            errors.defaultMessage ? "whatsapp-message-error" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
        <p className="admin-help" id="whatsapp-message-help">
          Dipakai di tombol WhatsApp umum: header, tombol melayang, dan section kontak.
        </p>
        <FieldError id="whatsapp-message-error" message={errors.defaultMessage} />
      </div>

      <div className="admin-card-footer">
        <div className="admin-card-footer-message">
          <CardMessage state={state} />
        </div>
        {testUrl ? (
          <a
            className="admin-button admin-button-secondary"
            href={testUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={16} aria-hidden="true" /> Coba buka WhatsApp
          </a>
        ) : (
          <span
            className="admin-button admin-button-secondary admin-button-disabled"
            aria-disabled="true"
            title="Isi nomor WhatsApp yang valid terlebih dahulu."
          >
            <ExternalLink size={16} aria-hidden="true" /> Coba buka WhatsApp
          </span>
        )}
        <button type="submit" className="admin-button admin-button-primary" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
    </form>
  );
}
