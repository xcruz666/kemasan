export type Status = "draft" | "published";

/** Uploaded image stored in DATA_DIR/uploads. */
export type ImageRef = {
  file: string;
  alt: string;
  width: number;
  height: number;
};

export type Spec = { label: string; value: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  categoryId: string | null;
  summary: string;
  /** Markdown. */
  description: string;
  specs: Spec[];
  /** Whole rupiah. null shows "Tanya harga". */
  price: number | null;
  priceUnit: string;
  images: ImageRef[];
  featured: boolean;
  status: Status;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  /** Absolute URL; empty or missing means the page's own URL. */
  canonicalUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type Page = {
  id: string;
  slug: string;
  title: string;
  /** Markdown. */
  body: string;
  coverImage: ImageRef | null;
  showInMenu: boolean;
  menuOrder: number;
  status: Status;
  seoTitle: string;
  seoDescription: string;
  /** Absolute URL; empty or missing means the page's own URL. */
  canonicalUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
};

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;
export type PageInput = Omit<Page, "id" | "createdAt" | "updatedAt">;
export type CategoryInput = Pick<Category, "name" | "slug">;

export type FieldErrors = Record<string, string>;

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; errors: FieldErrors };
