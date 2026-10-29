"use client";

import { useState } from "react";
import { whatsappUrl } from "@/lib/brand";
import { fillQuoteTemplate, type LandingContent } from "@/lib/content/landing-shared";
import { WhatsAppIcon } from "./whatsapp-icon";

export function QuoteForm({
  phone,
  form,
}: {
  phone: string;
  form: LandingContent["contact"]["form"];
}) {
  const [product, setProduct] = useState(form.productOptions[0] ?? "");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState("");
  const message = fillQuoteTemplate(form.messageTemplate, {
    produk: product,
    ukuran: size.trim() || form.sizeFallback,
    jumlah: quantity.trim() || form.quantityFallback,
  });
  return (
    <div className="quote-form">
      <div className="form-heading">
        <span className="eyebrow">{form.eyebrow}</span>
        <span className="form-number">{form.stepLabel}</span>
      </div>
      <label htmlFor="product">{form.productLabel}</label>
      <select
        id="product"
        value={product}
        onChange={(event) => setProduct(event.target.value)}
      >
        {form.productOptions.map((item, index) => (
          <option key={index}>{item}</option>
        ))}
      </select>
      <div className="form-row">
        <div>
          <label htmlFor="size">{form.sizeLabel}</label>
          <input
            id="size"
            value={size}
            onChange={(event) => setSize(event.target.value)}
            maxLength={100}
            placeholder={form.sizePlaceholder}
          />
        </div>
        <div>
          <label htmlFor="quantity">{form.quantityLabel}</label>
          <input
            id="quantity"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            maxLength={100}
            placeholder={form.quantityPlaceholder}
          />
        </div>
      </div>
      <p className="form-help">{form.help}</p>
      <a
        className="button quote-submit"
        href={whatsappUrl(phone, message)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <WhatsAppIcon /> {form.buttonLabel}
      </a>
      <p className="form-note">{form.note}</p>
    </div>
  );
}
