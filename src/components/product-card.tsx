import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import type { Product } from "@/lib/content/types";
import { uploadUrl } from "@/lib/content/image-ref";
import { priceLabel } from "@/lib/format";

type ProductCardProps = {
  product: Product;
  /** Heading level of the product name. Use h2 when the card sits directly under the page h1. */
  headingLevel?: "h2" | "h3";
};

export function ProductCard({
  product,
  headingLevel = "h3",
}: ProductCardProps) {
  const image = product.images[0];
  const Heading = headingLevel;

  return (
    <Link className="product-card" href={`/katalog/${product.slug}`}>
      <div className="product-card-media">
        {image ? (
          <Image
            src={uploadUrl(image.file)}
            alt={image.alt || product.name}
            width={image.width}
            height={image.height}
            sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="product-card-placeholder" aria-hidden="true">
            <Package size={40} strokeWidth={1.2} />
          </div>
        )}
      </div>
      <div className="product-card-body">
        <Heading className="product-card-title">{product.name}</Heading>
        {product.summary && (
          <p className="product-card-summary">{product.summary}</p>
        )}
        <p className="product-card-price">{priceLabel(product)}</p>
      </div>
    </Link>
  );
}
