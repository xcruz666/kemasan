"use client";

import { type FormEvent, useActionState, useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { initialFormState } from "@/app/admin/actions/form-state";
import { saveLandingAction } from "@/app/admin/actions/landing";
import type { LandingContent } from "@/lib/content/landing-shared";
import { FormMessage, submitWithoutReset } from "./form-parts";
import { LandingErrors, hasErrorUnder } from "./landing-fields";
import {
  ApplicationsSection,
  BenefitsSection,
  ContactSection,
  type FaqRow,
  FaqSection,
  FeaturedSection,
  HeroSection,
  type OptionRow,
  ProductSection,
  ProofSection,
  StepsSection,
} from "./landing-sections";

/** crypto.randomUUID only exists on https or localhost; plain-http hosting needs a fallback. */
function newRowId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `row-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function LandingForm({ landing }: { landing: LandingContent }) {
  const [state, formAction, pending] = useActionState(saveLandingAction, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);

  const [content, setContent] = useState(landing);
  // FAQ items and quote-form options can be added and reordered, so each row
  // gets a client-only id (index-based at first, so server and client HTML match).
  const [faqRows, setFaqRows] = useState<FaqRow[]>(() =>
    landing.faq.items.map((item, index) => ({ id: `faq-${index}`, ...item })),
  );
  const [optionRows, setOptionRows] = useState<OptionRow[]>(() =>
    landing.contact.form.productOptions.map((value, index) => ({ id: `option-${index}`, value })),
  );
  // Row errors are keyed by index; remember the order at save time so errors
  // stay on the right row if the admin reorders afterwards.
  const [submitted, setSubmitted] = useState<{ faq: string[]; options: string[] }>({
    faq: [],
    options: [],
  });
  const errors = state.errors;

  const faqError = (id: string, field: "question" | "answer") => {
    const index = submitted.faq.indexOf(id);
    return index === -1 ? undefined : errors[`faq.items.${index}.${field}`];
  };
  const optionError = (id: string) => {
    const index = submitted.options.indexOf(id);
    return index === -1 ? undefined : errors[`contact.form.productOptions.${index}`];
  };

  function update<K extends keyof LandingContent>(key: K, patch: Partial<LandingContent[K]>) {
    setContent((current) => ({ ...current, [key]: { ...current[key], ...patch } }));
  }

  // Open every section that has an error after a failed save.
  useEffect(() => {
    if (state.status !== "error") return;
    formRef.current?.querySelectorAll<HTMLDetailsElement>("details[data-section]").forEach((details) => {
      if (hasErrorUnder(state.errors, details.dataset.section ?? "")) details.open = true;
    });
  }, [state]);

  const payload = JSON.stringify({
    ...content,
    // The uploaded photo's own alt mirrors the field shown in the form.
    hero: {
      ...content.hero,
      image: content.hero.image && { ...content.hero.image, alt: content.hero.imageAlt },
    },
    product: {
      ...content.product,
      image: content.product.image && { ...content.product.image, alt: content.product.imageAlt },
    },
    faq: {
      ...content.faq,
      items: faqRows.map(({ question, answer }) => ({ question, answer })),
    },
    contact: {
      ...content.contact,
      form: { ...content.contact.form, productOptions: optionRows.map((row) => row.value) },
    },
  } satisfies LandingContent);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    setSubmitted({ faq: faqRows.map((row) => row.id), options: optionRows.map((row) => row.id) });
    submitWithoutReset(formAction)(event);
  }

  return (
    // noValidate: a required field inside a closed <details> would block the
    // submit without a visible message; the server reports errors instead.
    <form ref={formRef} className="admin-form" onSubmit={handleSubmit} noValidate>
      <input type="hidden" name="payload" value={payload} />
      <FormMessage state={state} />

      <LandingErrors.Provider value={errors}>
        <HeroSection value={content.hero} onChange={(patch) => update("hero", patch)} />
        <ProofSection value={content.proof} onChange={(patch) => update("proof", patch)} />
        <BenefitsSection value={content.benefits} onChange={(patch) => update("benefits", patch)} />
        <ProductSection value={content.product} onChange={(patch) => update("product", patch)} />
        <FeaturedSection value={content.featured} onChange={(patch) => update("featured", patch)} />
        <ApplicationsSection
          value={content.applications}
          onChange={(patch) => update("applications", patch)}
        />
        <StepsSection value={content.steps} onChange={(patch) => update("steps", patch)} />
        <FaqSection
          value={content.faq}
          onChange={(patch) => update("faq", patch)}
          rows={faqRows}
          onRows={setFaqRows}
          rowError={faqError}
          newRowId={newRowId}
        />
        <ContactSection
          value={content.contact}
          onChange={(patch) => update("contact", patch)}
          options={optionRows}
          onOptions={setOptionRows}
          optionError={optionError}
          newRowId={newRowId}
        />
      </LandingErrors.Provider>

      <div className="admin-form-footer landing-footer">
        {/* Announced by FormMessage at the top; repeated here next to the button. */}
        <div className="landing-footer-message">
          {state.status !== "idle" && (
            <span className={state.status === "success" ? "admin-success" : "admin-error"}>
              {state.message}
            </span>
          )}
        </div>
        <a
          className="admin-button admin-button-secondary"
          href="/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink size={16} aria-hidden="true" /> Lihat halaman
        </a>
        <button type="submit" className="admin-button admin-button-primary" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
    </form>
  );
}
