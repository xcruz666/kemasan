import type { Product } from "@/lib/content/types";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatRupiah(value: number): string {
  return rupiah.format(value);
}

export function priceLabel(product: Pick<Product, "price" | "priceUnit">): string {
  if (product.price === null) return "Tanya harga";
  const unit = product.priceUnit.trim();
  return unit ? `${formatRupiah(product.price)} / ${unit}` : formatRupiah(product.price);
}
