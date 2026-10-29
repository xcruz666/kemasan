"use client";

import { useState } from "react";
import { brand, whatsappUrl } from "@/lib/brand";
import { WhatsAppIcon } from "./whatsapp-icon";

export function QuoteForm({ phone }: { phone: string }) {
  const [product, setProduct] = useState("Daging & unggas");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState("");
  const message = `Halo ${brand.name}, saya ingin meminta penawaran kantong vacuum.\n\nProduk yang dikemas: ${product}\nUkuran: ${size.trim() || "Mohon rekomendasi"}\nJumlah kebutuhan: ${quantity.trim() || "Ingin konsultasi dahulu"}\n\nMohon informasi harga, minimum pemesanan, dan ketersediaannya. Terima kasih.`;
  return (
    <div className="quote-form">
      <div className="form-heading">
        <span className="eyebrow">MULAI DARI KEBUTUHAN ANDA</span>
        <span className="form-number">01 — 03</span>
      </div>
      <label htmlFor="product">Apa yang ingin Anda kemas?</label>
      <select
        id="product"
        value={product}
        onChange={(event) => setProduct(event.target.value)}
      >
        {[
          "Daging & unggas",
          "Ikan & seafood",
          "Sayur & buah",
          "Produk olahan",
          "Produk lainnya",
        ].map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
      <div className="form-row">
        <div>
          <label htmlFor="size">Ukuran kemasan</label>
          <input
            id="size"
            value={size}
            onChange={(event) => setSize(event.target.value)}
            maxLength={100}
            placeholder="Contoh: 20 × 30 cm"
          />
        </div>
        <div>
          <label htmlFor="quantity">Jumlah kebutuhan</label>
          <input
            id="quantity"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            maxLength={100}
            placeholder="Contoh: 1.000 pcs"
          />
        </div>
      </div>
      <p className="form-help">
        Belum tahu ukurannya? Kosongkan saja, kami bantu pilihkan.
      </p>
      <a
        className="button quote-submit"
        href={whatsappUrl(phone, message)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <WhatsAppIcon /> Minta penawaran via WhatsApp
      </a>
      <p className="form-note">
        Detail kebutuhan diteruskan ke WhatsApp. Tanpa komitmen pembelian.
      </p>
    </div>
  );
}
