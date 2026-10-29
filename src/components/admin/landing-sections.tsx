"use client";

import { useContext } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import {
  DEFAULT_HERO_IMAGE,
  DEFAULT_PRODUCT_IMAGE,
  type LandingContent,
} from "@/lib/content/landing-shared";
import { FieldError } from "./form-parts";
import {
  GroupTitle,
  IconField,
  LandingErrors,
  LandingItem,
  LandingSection,
  TextField,
  VisibleField,
} from "./landing-fields";
import { LandingImageField } from "./landing-image-field";

type SectionProps<K extends keyof LandingContent> = {
  value: LandingContent[K];
  onChange: (patch: Partial<LandingContent[K]>) => void;
};

const EMPTY_MESSAGE_HELP = "Kosongkan untuk memakai pesan pembuka di Pengaturan.";

/** Copy of a fixed-length list with one item patched. */
function replaceAt<T extends object>(list: T[], index: number, patch: Partial<T>): T[] {
  return list.map((item, i) => (i === index ? { ...item, ...patch } : item));
}

/* Rows that can be added, removed, or reordered carry a client-only id. */
export type FaqRow = { id: string; question: string; answer: string };
export type OptionRow = { id: string; value: string };

export const FAQ_MAX = 12;
export const OPTIONS_MAX = 10;

export function HeroSection({ value, onChange }: SectionProps<"hero">) {
  return (
    <LandingSection path="hero" title="Hero">
      <GroupTitle>Teks utama</GroupTitle>
      <TextField
        path="hero.eyebrow"
        label="Teks kecil di atas judul"
        value={value.eyebrow}
        onChange={(eyebrow) => onChange({ eyebrow })}
      />
      <TextField
        path="hero.title"
        label="Judul"
        kind="heading"
        value={value.title}
        onChange={(title) => onChange({ title })}
        required
      />
      <TextField
        path="hero.highlight"
        label="Kata bergaris bawah"
        value={value.highlight}
        onChange={(highlight) => onChange({ highlight })}
        help="Tampil di akhir judul dengan garis aksen. Kosongkan bila tidak perlu."
      />
      <TextField
        path="hero.description"
        label="Deskripsi"
        kind="text"
        value={value.description}
        onChange={(description) => onChange({ description })}
      />

      <GroupTitle>Tombol</GroupTitle>
      <div className="admin-field-row">
        <TextField
          path="hero.primaryLabel"
          label="Teks tombol WhatsApp"
          value={value.primaryLabel}
          onChange={(primaryLabel) => onChange({ primaryLabel })}
        />
        <TextField
          path="hero.secondaryLabel"
          label="Teks link ke bagian produk"
          value={value.secondaryLabel}
          onChange={(secondaryLabel) => onChange({ secondaryLabel })}
        />
      </div>
      <TextField
        path="hero.primaryMessage"
        label="Pesan WhatsApp tombol"
        kind="text"
        value={value.primaryMessage}
        onChange={(primaryMessage) => onChange({ primaryMessage })}
        help={EMPTY_MESSAGE_HELP}
      />
      <div className="admin-field-row">
        <TextField
          path="hero.footnotes.0"
          label="Catatan kecil 1"
          value={value.footnotes[0]}
          onChange={(text) => onChange({ footnotes: [text, value.footnotes[1]] })}
        />
        <TextField
          path="hero.footnotes.1"
          label="Catatan kecil 2"
          value={value.footnotes[1]}
          onChange={(text) => onChange({ footnotes: [value.footnotes[0], text] })}
        />
      </div>

      <GroupTitle>Foto & label</GroupTitle>
      <LandingImageField
        path="hero"
        label="Foto hero"
        image={value.image}
        alt={value.imageAlt}
        defaultSrc={DEFAULT_HERO_IMAGE}
        onImage={(image) => onChange({ image })}
        onAlt={(imageAlt) => onChange({ imageAlt })}
      />
      <div className="admin-field-row">
        <TextField
          path="hero.topLabel"
          label="Label di atas foto"
          value={value.topLabel}
          onChange={(topLabel) => onChange({ topLabel })}
        />
        <TextField
          path="hero.caption"
          label="Keterangan foto"
          value={value.caption}
          onChange={(caption) => onChange({ caption })}
        />
        <TextField
          path="hero.materialTitle"
          label="Label material: judul"
          value={value.materialTitle}
          onChange={(materialTitle) => onChange({ materialTitle })}
        />
        <TextField
          path="hero.materialNote"
          label="Label material: keterangan"
          value={value.materialNote}
          onChange={(materialNote) => onChange({ materialNote })}
        />
      </div>
      <LandingItem title="Lingkaran di foto">
        <div className="admin-field-row">
          <TextField
            path="hero.roundTop"
            label="Teks atas"
            value={value.roundTop}
            onChange={(roundTop) => onChange({ roundTop })}
          />
          <TextField
            path="hero.roundBottom"
            label="Teks bawah"
            value={value.roundBottom}
            onChange={(roundBottom) => onChange({ roundBottom })}
          />
        </div>
        <TextField
          path="hero.roundMain"
          label="Teks utama"
          kind="heading"
          value={value.roundMain}
          onChange={(roundMain) => onChange({ roundMain })}
        />
      </LandingItem>
    </LandingSection>
  );
}

export function ProofSection({ value, onChange }: SectionProps<"proof">) {
  return (
    <LandingSection path="proof" title="Strip karakteristik" hidden={!value.visible}>
      <VisibleField
        path="proof.visible"
        checked={value.visible}
        onChange={(visible) => onChange({ visible })}
      />
      <p className="admin-help">Baris di bawah hero. Contoh: Material <strong>food grade</strong>.</p>
      <div className="landing-items">
        {value.items.map((item, index) => (
          <LandingItem key={index} title={`Item ${index + 1}`}>
            <div className="landing-item-grid">
              <IconField
                path={`proof.items.${index}.icon`}
                value={item.icon}
                onChange={(icon) => onChange({ items: replaceAt(value.items, index, { icon }) })}
              />
              <TextField
                path={`proof.items.${index}.text`}
                label="Teks"
                value={item.text}
                onChange={(text) => onChange({ items: replaceAt(value.items, index, { text }) })}
              />
              <TextField
                path={`proof.items.${index}.strong`}
                label="Teks tebal"
                value={item.strong}
                onChange={(strong) => onChange({ items: replaceAt(value.items, index, { strong }) })}
              />
            </div>
          </LandingItem>
        ))}
      </div>
    </LandingSection>
  );
}

/** Eyebrow, heading, and description shared by most sections. */
function SectionHeading<K extends "benefits" | "product" | "featured" | "steps" | "faq">({
  path,
  value,
  onChange,
}: {
  path: K;
  value: { eyebrow: string; title: string; description: string };
  onChange: (patch: Partial<LandingContent[K]>) => void;
}) {
  const patch = (field: "eyebrow" | "title" | "description", text: string) =>
    onChange({ [field]: text } as Partial<LandingContent[K]>);
  return (
    <>
      <TextField
        path={`${path}.eyebrow`}
        label="Teks kecil di atas judul"
        value={value.eyebrow}
        onChange={(text) => patch("eyebrow", text)}
      />
      <TextField
        path={`${path}.title`}
        label="Judul"
        kind="heading"
        value={value.title}
        onChange={(text) => patch("title", text)}
      />
      <TextField
        path={`${path}.description`}
        label="Deskripsi"
        kind="text"
        value={value.description}
        onChange={(text) => patch("description", text)}
      />
    </>
  );
}

export function BenefitsSection({ value, onChange }: SectionProps<"benefits">) {
  return (
    <LandingSection path="benefits" title="Keunggulan" hidden={!value.visible}>
      <VisibleField
        path="benefits.visible"
        checked={value.visible}
        onChange={(visible) => onChange({ visible })}
        menuLabel="Keunggulan"
      />
      <SectionHeading path="benefits" value={value} onChange={onChange} />
      <div className="landing-items">
        {value.cards.map((card, index) => (
          <LandingItem key={index} title={`Kartu ${index + 1}`}>
            <IconField
              path={`benefits.cards.${index}.icon`}
              value={card.icon}
              onChange={(icon) => onChange({ cards: replaceAt(value.cards, index, { icon }) })}
            />
            <TextField
              path={`benefits.cards.${index}.title`}
              label="Judul"
              value={card.title}
              onChange={(title) => onChange({ cards: replaceAt(value.cards, index, { title }) })}
            />
            <TextField
              path={`benefits.cards.${index}.text`}
              label="Teks"
              kind="text"
              value={card.text}
              onChange={(text) => onChange({ cards: replaceAt(value.cards, index, { text }) })}
            />
          </LandingItem>
        ))}
      </div>
    </LandingSection>
  );
}

export function ProductSection({ value, onChange }: SectionProps<"product">) {
  return (
    <LandingSection path="product" title="Kenali produk" hidden={!value.visible}>
      <VisibleField
        path="product.visible"
        checked={value.visible}
        onChange={(visible) => onChange({ visible })}
        menuLabel="Produk"
        note="Link “Kenali produknya” di hero juga mengarah ke bagian ini."
      />
      <LandingImageField
        path="product"
        label="Foto produk"
        image={value.image}
        alt={value.imageAlt}
        defaultSrc={DEFAULT_PRODUCT_IMAGE}
        onImage={(image) => onChange({ image })}
        onAlt={(imageAlt) => onChange({ imageAlt })}
      />
      <div className="admin-field-row">
        <TextField
          path="product.photoLabel"
          label="Label di foto"
          value={value.photoLabel}
          onChange={(photoLabel) => onChange({ photoLabel })}
        />
        <TextField
          path="product.photoNote"
          label="Keterangan foto"
          value={value.photoNote}
          onChange={(photoNote) => onChange({ photoNote })}
        />
      </div>
      <SectionHeading path="product" value={value} onChange={onChange} />
      <LandingItem title="Spesifikasi">
        <ol className="admin-specs">
          {value.specs.map((spec, index) => (
            <li key={index} className="admin-field-row">
              <TextField
                path={`product.specs.${index}.label`}
                label={`Label ${index + 1}`}
                value={spec.label}
                onChange={(label) => onChange({ specs: replaceAt(value.specs, index, { label }) })}
              />
              <TextField
                path={`product.specs.${index}.value`}
                label={`Isi ${index + 1}`}
                value={spec.value}
                onChange={(text) =>
                  onChange({ specs: replaceAt(value.specs, index, { value: text }) })
                }
              />
            </li>
          ))}
        </ol>
      </LandingItem>
      <TextField
        path="product.linkLabel"
        label="Teks link WhatsApp"
        value={value.linkLabel}
        onChange={(linkLabel) => onChange({ linkLabel })}
      />
      <TextField
        path="product.linkMessage"
        label="Pesan WhatsApp link"
        kind="text"
        value={value.linkMessage}
        onChange={(linkMessage) => onChange({ linkMessage })}
        help={EMPTY_MESSAGE_HELP}
      />
    </LandingSection>
  );
}

export function FeaturedSection({ value, onChange }: SectionProps<"featured">) {
  return (
    <LandingSection path="featured" title="Produk unggulan" hidden={!value.visible}>
      <VisibleField
        path="featured.visible"
        checked={value.visible}
        onChange={(visible) => onChange({ visible })}
        note="Bagian ini hanya tampil bila ada produk yang ditandai unggulan di menu Produk."
      />
      <SectionHeading path="featured" value={value} onChange={onChange} />
      <TextField
        path="featured.linkLabel"
        label="Teks link ke katalog"
        value={value.linkLabel}
        onChange={(linkLabel) => onChange({ linkLabel })}
      />
    </LandingSection>
  );
}

export function ApplicationsSection({ value, onChange }: SectionProps<"applications">) {
  return (
    <LandingSection path="applications" title="Aplikasi" hidden={!value.visible}>
      <VisibleField
        path="applications.visible"
        checked={value.visible}
        onChange={(visible) => onChange({ visible })}
      />
      <TextField
        path="applications.eyebrow"
        label="Teks kecil di atas judul"
        value={value.eyebrow}
        onChange={(eyebrow) => onChange({ eyebrow })}
      />
      <TextField
        path="applications.title"
        label="Judul"
        kind="heading"
        value={value.title}
        onChange={(title) => onChange({ title })}
      />
      <div className="admin-field-row">
        <TextField
          path="applications.linkLabel"
          label="Teks link ke bagian konsultasi"
          value={value.linkLabel}
          onChange={(linkLabel) => onChange({ linkLabel })}
        />
        <TextField
          path="applications.cardLinkLabel"
          label="Teks link di setiap kartu"
          value={value.cardLinkLabel}
          onChange={(cardLinkLabel) => onChange({ cardLinkLabel })}
        />
      </div>
      <div className="landing-items">
        {value.cards.map((card, index) => (
          <LandingItem key={index} title={`Kartu ${index + 1}`}>
            <div className="admin-field-row">
              <IconField
                path={`applications.cards.${index}.icon`}
                value={card.icon}
                onChange={(icon) => onChange({ cards: replaceAt(value.cards, index, { icon }) })}
              />
              <TextField
                path={`applications.cards.${index}.name`}
                label="Nama"
                value={card.name}
                onChange={(name) => onChange({ cards: replaceAt(value.cards, index, { name }) })}
              />
            </div>
            <TextField
              path={`applications.cards.${index}.text`}
              label="Teks"
              kind="text"
              value={card.text}
              onChange={(text) => onChange({ cards: replaceAt(value.cards, index, { text }) })}
            />
            <TextField
              path={`applications.cards.${index}.message`}
              label="Pesan WhatsApp kartu"
              kind="text"
              value={card.message}
              onChange={(message) => onChange({ cards: replaceAt(value.cards, index, { message }) })}
              help={EMPTY_MESSAGE_HELP}
            />
          </LandingItem>
        ))}
      </div>
    </LandingSection>
  );
}

export function StepsSection({ value, onChange }: SectionProps<"steps">) {
  return (
    <LandingSection path="steps" title="Cara pesan" hidden={!value.visible}>
      <VisibleField
        path="steps.visible"
        checked={value.visible}
        onChange={(visible) => onChange({ visible })}
        menuLabel="Cara pesan"
      />
      <SectionHeading path="steps" value={value} onChange={onChange} />
      <div className="landing-items">
        {value.items.map((step, index) => (
          <LandingItem key={index} title={`Langkah ${index + 1}`}>
            <TextField
              path={`steps.items.${index}.title`}
              label="Judul"
              value={step.title}
              onChange={(title) => onChange({ items: replaceAt(value.items, index, { title }) })}
            />
            <TextField
              path={`steps.items.${index}.text`}
              label="Teks"
              kind="text"
              value={step.text}
              onChange={(text) => onChange({ items: replaceAt(value.items, index, { text }) })}
            />
          </LandingItem>
        ))}
      </div>
    </LandingSection>
  );
}

export function FaqSection({
  value,
  onChange,
  rows,
  onRows,
  rowError,
  newRowId,
}: SectionProps<"faq"> & {
  rows: FaqRow[];
  onRows: (update: (rows: FaqRow[]) => FaqRow[]) => void;
  rowError: (id: string, field: "question" | "answer") => string | undefined;
  newRowId: () => string;
}) {
  const errors = useContext(LandingErrors);

  function patchRow(id: string, patch: Partial<FaqRow>) {
    onRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function move(index: number, offset: -1 | 1) {
    onRows((current) => {
      const target = index + offset;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <LandingSection path="faq" title="FAQ" hidden={!value.visible}>
      <VisibleField
        path="faq.visible"
        checked={value.visible}
        onChange={(visible) => onChange({ visible })}
        menuLabel="FAQ"
      />
      <SectionHeading path="faq" value={value} onChange={onChange} />
      <TextField
        path="faq.linkLabel"
        label="Teks link WhatsApp"
        value={value.linkLabel}
        onChange={(linkLabel) => onChange({ linkLabel })}
      />

      <GroupTitle>Pertanyaan</GroupTitle>
      <ol className="landing-items">
        {rows.map((row, index) => (
          <li key={row.id} className="landing-row">
            <div className="admin-menu-move">
              <button
                type="button"
                className="admin-icon-button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Naikkan pertanyaan ${index + 1}`}
              >
                <ArrowUp size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="admin-icon-button"
                onClick={() => move(index, 1)}
                disabled={index === rows.length - 1}
                aria-label={`Turunkan pertanyaan ${index + 1}`}
              >
                <ArrowDown size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="landing-row-body">
              <TextField
                path="faq.items.question"
                id={`landing-faq-${row.id}-question`}
                label={`Pertanyaan ${index + 1}`}
                value={row.question}
                onChange={(question) => patchRow(row.id, { question })}
                error={rowError(row.id, "question")}
                required
              />
              <TextField
                path="faq.items.answer"
                id={`landing-faq-${row.id}-answer`}
                label="Jawaban"
                kind="text"
                rows={4}
                value={row.answer}
                onChange={(answer) => patchRow(row.id, { answer })}
                error={rowError(row.id, "answer")}
                required
              />
            </div>
            <button
              type="button"
              className="admin-icon-button admin-icon-button-danger"
              onClick={() => onRows((current) => current.filter((item) => item.id !== row.id))}
              disabled={rows.length <= 1}
              aria-label={`Hapus pertanyaan ${index + 1}`}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
      <FieldError id="landing-faq-items-error" message={errors["faq.items"]} />
      <button
        type="button"
        className="admin-button admin-button-secondary admin-button-small landing-add"
        onClick={() =>
          onRows((current) => [...current, { id: newRowId(), question: "", answer: "" }])
        }
        disabled={rows.length >= FAQ_MAX}
      >
        <Plus size={16} aria-hidden="true" /> Tambah pertanyaan
      </button>
      <p className="admin-help">
        {rows.length >= FAQ_MAX
          ? `Sudah ${FAQ_MAX} pertanyaan, batas maksimal.`
          : `1–${FAQ_MAX} pertanyaan.`}
      </p>
    </LandingSection>
  );
}

export function ContactSection({
  value,
  onChange,
  options,
  onOptions,
  optionError,
  newRowId,
}: SectionProps<"contact"> & {
  options: OptionRow[];
  onOptions: (update: (rows: OptionRow[]) => OptionRow[]) => void;
  optionError: (id: string) => string | undefined;
  newRowId: () => string;
}) {
  const errors = useContext(LandingErrors);
  const form = value.form;
  const onForm = (patch: Partial<LandingContent["contact"]["form"]>) =>
    onChange({ form: { ...form, ...patch } });

  return (
    <LandingSection path="contact" title="Konsultasi & form penawaran" hidden={!value.visible}>
      <VisibleField
        path="contact.visible"
        checked={value.visible}
        onChange={(visible) => onChange({ visible })}
        note="Link “Diskusikan kebutuhan Anda” di bagian Aplikasi mengarah ke bagian ini."
      />
      <TextField
        path="contact.eyebrow"
        label="Teks kecil di atas judul"
        value={value.eyebrow}
        onChange={(eyebrow) => onChange({ eyebrow })}
      />
      <TextField
        path="contact.title"
        label="Judul"
        kind="heading"
        value={value.title}
        onChange={(title) => onChange({ title })}
      />
      <TextField
        path="contact.highlight"
        label="Baris terakhir judul (warna aksen)"
        value={value.highlight}
        onChange={(highlight) => onChange({ highlight })}
        help="Kosongkan bila tidak perlu."
      />
      <TextField
        path="contact.description"
        label="Deskripsi"
        kind="text"
        value={value.description}
        onChange={(description) => onChange({ description })}
        help="Nomor WhatsApp di bawahnya diatur di Pengaturan."
      />

      <GroupTitle>Form penawaran</GroupTitle>
      <div className="admin-field-row">
        <TextField
          path="contact.form.eyebrow"
          label="Judul kecil form"
          value={form.eyebrow}
          onChange={(eyebrow) => onForm({ eyebrow })}
        />
        <TextField
          path="contact.form.stepLabel"
          label="Label nomor"
          value={form.stepLabel}
          onChange={(stepLabel) => onForm({ stepLabel })}
        />
      </div>
      <TextField
        path="contact.form.productLabel"
        label="Label pilihan produk"
        value={form.productLabel}
        onChange={(productLabel) => onForm({ productLabel })}
      />

      <LandingItem title="Pilihan produk">
        <ol className="admin-specs">
          {options.map((option, index) => (
            <li key={option.id} className="landing-option-row">
              <TextField
                path="contact.form.productOptions"
                id={`landing-option-${option.id}`}
                label={`Pilihan ${index + 1}`}
                value={option.value}
                onChange={(text) =>
                  onOptions((current) =>
                    current.map((row) => (row.id === option.id ? { ...row, value: text } : row)),
                  )
                }
                error={optionError(option.id)}
              />
              <button
                type="button"
                className="admin-icon-button admin-icon-button-danger"
                onClick={() =>
                  onOptions((current) => current.filter((row) => row.id !== option.id))
                }
                disabled={options.length <= 1}
                aria-label={`Hapus pilihan ${index + 1}`}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
        <FieldError
          id="landing-contact-form-productOptions-error"
          message={errors["contact.form.productOptions"]}
        />
        <button
          type="button"
          className="admin-button admin-button-secondary admin-button-small landing-add"
          onClick={() => onOptions((current) => [...current, { id: newRowId(), value: "" }])}
          disabled={options.length >= OPTIONS_MAX}
        >
          <Plus size={16} aria-hidden="true" /> Tambah pilihan
        </button>
        <p className="admin-help">
          Pilihan pertama terpilih otomatis. 1–{OPTIONS_MAX} pilihan.
        </p>
      </LandingItem>

      <div className="admin-field-row">
        <TextField
          path="contact.form.sizeLabel"
          label="Label ukuran"
          value={form.sizeLabel}
          onChange={(sizeLabel) => onForm({ sizeLabel })}
        />
        <TextField
          path="contact.form.sizePlaceholder"
          label="Contoh isian ukuran"
          value={form.sizePlaceholder}
          onChange={(sizePlaceholder) => onForm({ sizePlaceholder })}
        />
        <TextField
          path="contact.form.quantityLabel"
          label="Label jumlah"
          value={form.quantityLabel}
          onChange={(quantityLabel) => onForm({ quantityLabel })}
        />
        <TextField
          path="contact.form.quantityPlaceholder"
          label="Contoh isian jumlah"
          value={form.quantityPlaceholder}
          onChange={(quantityPlaceholder) => onForm({ quantityPlaceholder })}
        />
      </div>
      <TextField
        path="contact.form.help"
        label="Teks bantuan di bawah isian"
        value={form.help}
        onChange={(help) => onForm({ help })}
      />
      <div className="admin-field-row">
        <TextField
          path="contact.form.buttonLabel"
          label="Teks tombol"
          value={form.buttonLabel}
          onChange={(buttonLabel) => onForm({ buttonLabel })}
        />
        <TextField
          path="contact.form.note"
          label="Catatan di bawah tombol"
          value={form.note}
          onChange={(note) => onForm({ note })}
        />
      </div>

      <GroupTitle>Pesan WhatsApp form</GroupTitle>
      <TextField
        path="contact.form.messageTemplate"
        label="Isi pesan"
        kind="text"
        rows={8}
        value={form.messageTemplate}
        onChange={(messageTemplate) => onForm({ messageTemplate })}
        help={
          <>
            <code>{"{produk}"}</code>, <code>{"{ukuran}"}</code>, dan <code>{"{jumlah}"}</code>{" "}
            diganti dengan jawaban pengunjung.
          </>
        }
      />
      <div className="admin-field-row">
        <TextField
          path="contact.form.sizeFallback"
          label="Pengganti ukuran bila dikosongkan"
          value={form.sizeFallback}
          onChange={(sizeFallback) => onForm({ sizeFallback })}
        />
        <TextField
          path="contact.form.quantityFallback"
          label="Pengganti jumlah bila dikosongkan"
          value={form.quantityFallback}
          onChange={(quantityFallback) => onForm({ quantityFallback })}
        />
      </div>
    </LandingSection>
  );
}
