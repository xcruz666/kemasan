/** Client-safe landing page content: types, defaults, and validation. */
import { isImageRef } from "./image-ref";
import type { FieldErrors, ImageRef, Result } from "./types";

/** Icons the admin can pick. The public site maps each key to a lucide icon. */
export const ICON_OPTIONS = [
  { key: "shield-check", label: "Perisai" },
  { key: "layers", label: "Lapisan" },
  { key: "ruler", label: "Penggaris" },
  { key: "factory", label: "Pabrik" },
  { key: "snowflake", label: "Salju / beku" },
  { key: "package", label: "Paket" },
  { key: "box", label: "Kotak" },
  { key: "beef", label: "Daging" },
  { key: "drumstick", label: "Unggas" },
  { key: "fish", label: "Ikan" },
  { key: "carrot", label: "Sayur" },
  { key: "egg", label: "Telur" },
  { key: "wheat", label: "Gandum" },
  { key: "utensils", label: "Peralatan makan" },
  { key: "chef-hat", label: "Topi koki" },
  { key: "leaf", label: "Daun" },
  { key: "droplets", label: "Tetesan air" },
  { key: "thermometer", label: "Termometer" },
  { key: "truck", label: "Truk" },
  { key: "store", label: "Toko" },
  { key: "scale", label: "Timbangan" },
  { key: "clock", label: "Jam" },
  { key: "sparkles", label: "Kilau" },
  { key: "badge-check", label: "Lencana centang" },
  { key: "recycle", label: "Daur ulang" },
] as const;

export type IconKey = (typeof ICON_OPTIONS)[number]["key"];

const ICON_KEYS = new Set<string>(ICON_OPTIONS.map((option) => option.key));

/**
 * Text fields keep line breaks: "\n" in a heading renders as <br>, matching the
 * original design. A null image means the built-in photo in /public/images.
 */
export type LandingContent = {
  hero: {
    eyebrow: string;
    /** Heading before the underlined word; "\n" breaks the line. */
    title: string;
    /** Underlined word at the end of the heading. */
    highlight: string;
    description: string;
    primaryLabel: string;
    /** WhatsApp message for the main button; empty uses the site default. */
    primaryMessage: string;
    secondaryLabel: string;
    footnotes: [string, string];
    image: ImageRef | null;
    imageAlt: string;
    topLabel: string;
    materialTitle: string;
    materialNote: string;
    caption: string;
    roundTop: string;
    roundMain: string;
    roundBottom: string;
  };
  proof: {
    visible: boolean;
    items: { icon: IconKey; text: string; strong: string }[];
  };
  benefits: {
    visible: boolean;
    eyebrow: string;
    title: string;
    description: string;
    cards: { icon: IconKey; title: string; text: string }[];
  };
  product: {
    visible: boolean;
    image: ImageRef | null;
    imageAlt: string;
    photoLabel: string;
    photoNote: string;
    eyebrow: string;
    title: string;
    description: string;
    specs: { label: string; value: string }[];
    linkLabel: string;
    linkMessage: string;
  };
  featured: {
    visible: boolean;
    eyebrow: string;
    title: string;
    description: string;
    linkLabel: string;
  };
  applications: {
    visible: boolean;
    eyebrow: string;
    title: string;
    linkLabel: string;
    cardLinkLabel: string;
    cards: { icon: IconKey; name: string; text: string; message: string }[];
  };
  steps: {
    visible: boolean;
    eyebrow: string;
    title: string;
    description: string;
    items: { title: string; text: string }[];
  };
  faq: {
    visible: boolean;
    eyebrow: string;
    title: string;
    description: string;
    linkLabel: string;
    items: { question: string; answer: string }[];
  };
  contact: {
    visible: boolean;
    eyebrow: string;
    title: string;
    /** Last line of the heading, shown in the accent colour. */
    highlight: string;
    description: string;
    form: {
      eyebrow: string;
      stepLabel: string;
      productLabel: string;
      productOptions: string[];
      sizeLabel: string;
      sizePlaceholder: string;
      quantityLabel: string;
      quantityPlaceholder: string;
      help: string;
      buttonLabel: string;
      note: string;
      /** {produk}, {ukuran}, and {jumlah} are replaced with the visitor's answers. */
      messageTemplate: string;
      sizeFallback: string;
      quantityFallback: string;
    };
  };
};

/** Built-in photos, used while the admin has not uploaded a replacement. */
export const DEFAULT_HERO_IMAGE = "/images/vacuum-food.webp";
export const DEFAULT_PRODUCT_IMAGE = "/images/vacuum-pouches.webp";

/** Exactly the text the site shipped with, so nothing changes until the admin edits it. */
export const DEFAULT_LANDING: LandingContent = {
  hero: {
    eyebrow: "PARTNER KEMASAN BISNIS ANDA",
    title: "Yang segar,\ntetap",
    highlight: "segar.",
    description:
      "Kantong vacuum premium untuk menjaga kualitas produk. Dari dapur usaha hingga kebutuhan industri.",
    primaryLabel: "Tanya harga grosir",
    primaryMessage: "",
    secondaryLabel: "Kenali produknya",
    footnotes: ["Ukuran fleksibel", "Pasokan langsung dari pabrik"],
    image: null,
    imageAlt: "Ilustrasi salmon dan brokoli di dalam kantong vacuum bening",
    topLabel: "KESEGARAN, TERBUNGKUS RAPI.",
    materialTitle: "Jernih. Rapat. Kuat.",
    materialNote: "NYLON + LLDPE",
    caption: "Ilustrasi penggunaan produk",
    roundTop: "DIBUAT UNTUK",
    roundMain: "lebih\nterjaga.",
    roundBottom: "SETIAP HARI",
  },
  proof: {
    visible: true,
    items: [
      { icon: "shield-check", text: "Material", strong: "food grade" },
      { icon: "layers", text: "Ketebalan", strong: "75 mikron" },
      { icon: "ruler", text: "Ukuran", strong: "sesuai kebutuhan" },
      { icon: "factory", text: "Dukungan", strong: "skala industri" },
    ],
  },
  benefits: {
    visible: true,
    eyebrow: "01 / LEBIH DARI SEKADAR PLASTIK",
    title: "Produk Anda berharga.\nKemas dengan semestinya.",
    description:
      "Di balik produk yang baik, ada kemasan yang bekerja dengan baik. Sampai ke tangan pelanggan.",
    cards: [
      {
        icon: "shield-check",
        title: "Kesegaran lebih terjaga",
        text: "Kemasan rapat membantu mengurangi kontak dengan udara dan menjaga kualitas produk selama penyimpanan.",
      },
      {
        icon: "snowflake",
        title: "Siap masuk freezer",
        text: "Membantu melindungi produk dari freezer burn, dengan proses vacuum dan penyimpanan yang tepat.",
      },
      {
        icon: "package",
        title: "Ruang lebih efisien",
        text: "Tanpa udara berlebih. Produk lebih ringkas, mudah ditata, dan memaksimalkan ruang penyimpanan Anda.",
      },
    ],
  },
  product: {
    visible: true,
    image: null,
    imageAlt: "Ilustrasi tumpukan kantong vacuum transparan dengan tepi tersegel",
    photoLabel: "KANTONG VACUUM / SERI PREMIUM",
    photoNote: "Ilustrasi produk",
    eyebrow: "02 / KENALI KEMASAN ANDA",
    title: "Sederhana bentuknya.\nSerius kualitasnya.",
    description:
      "Kantong vacuum bening dengan komposisi material premium. Dirancang untuk kebutuhan pengemasan usaha Anda.",
    specs: [
      { label: "Material", value: "Nylon + LLDPE" },
      { label: "Ketebalan standar", value: "75 mikron" },
      { label: "Tampilan", value: "Bening / transparan" },
      { label: "Pilihan ukuran", value: "Sesuai kebutuhan" },
      { label: "Ketebalan lainnya", value: "Tersedia sesuai konsultasi" },
    ],
    linkLabel: "Temukan ukuran yang pas",
    linkMessage:
      "Halo Optima Kemasan Prima, saya ingin konsultasi ukuran dan ketebalan kantong vacuum yang cocok untuk produk dan mesin saya.",
  },
  featured: {
    visible: true,
    eyebrow: "PRODUK UNGGULAN",
    title: "Pilihan kemasan\nuntuk usaha Anda.",
    description:
      "Lihat detail ukuran, spesifikasi, dan harga, lalu tanyakan ketersediaannya langsung ke tim kami.",
    linkLabel: "Lihat semua produk",
  },
  applications: {
    visible: true,
    eyebrow: "03 / SATU KEMASAN, BANYAK KEBUTUHAN",
    title: "Apapun usaha Anda,\nkami bantu kemas.",
    linkLabel: "Diskusikan kebutuhan Anda",
    cardLinkLabel: "Konsultasi kemasan",
    cards: [
      {
        icon: "beef",
        name: "Daging & unggas",
        text: "Dari potongan segar hingga stok beku, kemas dengan lebih rapat.",
        message:
          "Halo Optima Kemasan Prima, saya ingin konsultasi kantong vacuum untuk daging & unggas. Mohon rekomendasi ukuran dan penawaran harganya.",
      },
      {
        icon: "fish",
        name: "Ikan & seafood",
        text: "Kemasan jernih yang memperlihatkan kualitas produk Anda.",
        message:
          "Halo Optima Kemasan Prima, saya ingin konsultasi kantong vacuum untuk ikan & seafood. Mohon rekomendasi ukuran dan penawaran harganya.",
      },
      {
        icon: "carrot",
        name: "Sayur & buah",
        text: "Porsi lebih rapi untuk persiapan bahan dan kebutuhan distribusi.",
        message:
          "Halo Optima Kemasan Prima, saya ingin konsultasi kantong vacuum untuk sayur & buah. Mohon rekomendasi ukuran dan penawaran harganya.",
      },
      {
        icon: "utensils",
        name: "Produk olahan",
        text: "Untuk sosis, bakso, dan berbagai produk siap diolah.",
        message:
          "Halo Optima Kemasan Prima, saya ingin konsultasi kantong vacuum untuk produk olahan. Mohon rekomendasi ukuran dan penawaran harganya.",
      },
    ],
  },
  steps: {
    visible: true,
    eyebrow: "04 / DARI KEBUTUHAN JADI PESANAN",
    title: "Pesan dengan mudah.\nKami bantu sampai pas.",
    description:
      "Komunikasi langsung, supaya kemasan yang Anda pesan benar-benar sesuai kebutuhan.",
    items: [
      {
        title: "Ceritakan kebutuhan",
        text: "Sampaikan jenis produk, ukuran kemasan, dan perkiraan jumlah pesanan.",
      },
      {
        title: "Dapatkan penawaran",
        text: "Kami bantu sesuaikan spesifikasi dan berikan penawaran untuk bisnis Anda.",
      },
      {
        title: "Konfirmasi & siapkan",
        text: "Sepakati detail pesanan dan pengiriman bersama tim kami melalui WhatsApp.",
      },
    ],
  },
  faq: {
    visible: true,
    eyebrow: "05 / SEBELUM ANDA MEMESAN",
    title: "Masih ada\npertanyaan?",
    description: "Kami siap membantu Anda\nmemilih kemasan yang tepat.",
    linkLabel: "Tanya langsung ke tim kami",
    items: [
      {
        question: "Apakah ukuran dan ketebalannya bisa disesuaikan?",
        answer:
          "Bisa. Selain ketebalan standar 75 mikron, Anda dapat mendiskusikan ukuran dan ketebalan sesuai produk yang dikemas. Kirim kebutuhan melalui WhatsApp untuk konfirmasi pilihan dan ketersediaannya.",
      },
      {
        question: "Berapa harga dan minimum pemesanannya?",
        answer:
          "Harga dan minimum pemesanan menyesuaikan ukuran, ketebalan, dan jumlah kebutuhan. Hubungi kami dengan detail tersebut agar tim dapat memberikan penawaran yang sesuai.",
      },
      {
        question: "Apakah cocok untuk mesin vacuum saya?",
        answer:
          "Kecocokan kantong bergantung pada jenis mesin dan permukaan kantong yang dibutuhkan. Sampaikan merek atau tipe mesin Anda saat konsultasi agar kami dapat membantu memastikan kecocokannya sebelum pemesanan.",
      },
      {
        question: "Apakah kantong ini bisa digunakan untuk produk beku?",
        answer:
          "Kantong vacuum dapat membantu melindungi produk selama penyimpanan beku bila proses pengemasan dan penyimpanannya tepat. Informasikan jenis produk serta kondisi penyimpanan Anda untuk rekomendasi kemasan.",
      },
      {
        question: "Bagaimana proses pemesanan dan pengirimannya?",
        answer:
          "Kirim kebutuhan produk, ukuran, dan jumlah melalui WhatsApp. Setelah spesifikasi, harga, serta ketersediaan disepakati, tim akan mengonfirmasi pembayaran, jadwal, dan biaya pengiriman ke alamat Anda.",
      },
    ],
  },
  contact: {
    visible: true,
    eyebrow: "KEMASAN TEPAT. BISNIS SIAP.",
    title: "Mari kemas\nhal baik",
    highlight: "berikutnya.",
    description: "Mulai dengan cerita tentang produk Anda.\nBiar kami bantu urusan kemasannya.",
    form: {
      eyebrow: "MULAI DARI KEBUTUHAN ANDA",
      stepLabel: "01 — 03",
      productLabel: "Apa yang ingin Anda kemas?",
      productOptions: [
        "Daging & unggas",
        "Ikan & seafood",
        "Sayur & buah",
        "Produk olahan",
        "Produk lainnya",
      ],
      sizeLabel: "Ukuran kemasan",
      sizePlaceholder: "Contoh: 20 × 30 cm",
      quantityLabel: "Jumlah kebutuhan",
      quantityPlaceholder: "Contoh: 1.000 pcs",
      help: "Belum tahu ukurannya? Kosongkan saja, kami bantu pilihkan.",
      buttonLabel: "Minta penawaran via WhatsApp",
      note: "Detail kebutuhan diteruskan ke WhatsApp. Tanpa komitmen pembelian.",
      messageTemplate:
        "Halo Optima Kemasan Prima, saya ingin meminta penawaran kantong vacuum.\n\nProduk yang dikemas: {produk}\nUkuran: {ukuran}\nJumlah kebutuhan: {jumlah}\n\nMohon informasi harga, minimum pemesanan, dan ketersediaannya. Terima kasih.",
      sizeFallback: "Mohon rekomendasi",
      quantityFallback: "Ingin konsultasi dahulu",
    },
  },
};

/** Lists the admin may grow or shrink; every other list keeps the design's item count. */
const VARIABLE_LISTS: Record<string, { min: number; max: number; label: string }> = {
  "faq.items": { min: 1, max: 12, label: "Pertanyaan FAQ" },
  "contact.form.productOptions": { min: 1, max: 10, label: "Pilihan produk" },
};

const REQUIRED_FIELDS = new Set(["hero.title", "faq.items.question", "faq.items.answer"]);

function maxLength(key: string) {
  if (/message|template/i.test(key)) return 1000;
  if (key === "answer" || key === "description" || key === "text") return 600;
  return 200;
}

type Mode = "strict" | "lenient";

/**
 * Walks the default content and copies matching values from the input.
 * strict (admin save): wrong types and over-long text become field errors.
 * lenient (reading the file): anything missing or broken falls back to the default.
 */
function normalize(
  fallback: unknown,
  input: unknown,
  path: string[],
  errors: FieldErrors,
  mode: Mode,
): unknown {
  const key = path[path.length - 1] ?? "";
  const pathKey = path.join(".");
  const shapeKey = path.filter((part) => !/^\d+$/.test(part)).join(".");

  if (key === "image" || key === "favicon") {
    if (input === null || input === undefined) return null;
    if (isImageRef(input)) return input;
    if (mode === "strict") errors[pathKey] = "Data foto tidak valid. Upload ulang fotonya.";
    return null;
  }

  if (key === "icon") {
    if (typeof input === "string" && ICON_KEYS.has(input)) return input;
    if (mode === "strict") errors[pathKey] = "Ikon tidak dikenal.";
    return fallback;
  }

  if (typeof fallback === "string") {
    if (typeof input !== "string") {
      if (mode === "strict") errors[pathKey] = "Isian tidak valid.";
      return fallback;
    }
    const value = input.replace(/\r\n?/g, "\n").trim();
    const max = maxLength(key);
    if (mode === "strict") {
      if (!value && REQUIRED_FIELDS.has(shapeKey)) errors[pathKey] = "Wajib diisi.";
      else if (value.length > max) errors[pathKey] = `Maksimal ${max} karakter.`;
    }
    return value.slice(0, max);
  }

  if (typeof fallback === "boolean") {
    if (typeof input === "boolean") return input;
    if (mode === "strict") errors[pathKey] = "Isian tidak valid.";
    return fallback;
  }

  if (Array.isArray(fallback)) {
    const list = Array.isArray(input) ? input : [];
    if (!Array.isArray(input) && mode === "strict") errors[pathKey] = "Isian tidak valid.";
    const variable = VARIABLE_LISTS[shapeKey];
    if (variable) {
      if (mode === "lenient" && list.length === 0) return fallback;
      if (mode === "strict" && (list.length < variable.min || list.length > variable.max)) {
        errors[pathKey] = `${variable.label} harus ${variable.min}–${variable.max} item.`;
      }
      const template = typeof fallback[0] === "string" ? "" : blank(fallback[0]);
      return list
        .slice(0, variable.max)
        .map((item, index) => normalize(template, item, [...path, String(index)], errors, mode));
    }
    // Fixed-length list: one entry per design slot.
    return fallback.map((item, index) =>
      normalize(item, list[index], [...path, String(index)], errors, mode),
    );
  }

  if (fallback && typeof fallback === "object") {
    const source =
      input && typeof input === "object" && !Array.isArray(input)
        ? (input as Record<string, unknown>)
        : {};
    if (input !== undefined && source !== input && mode === "strict") {
      errors[pathKey || "form"] = "Isian tidak valid.";
    }
    const result: Record<string, unknown> = {};
    for (const [field, value] of Object.entries(fallback)) {
      result[field] = normalize(value, source[field], [...path, field], errors, mode);
    }
    return result;
  }

  return fallback;
}

/** Same shape as the sample item, with every string emptied. */
function blank(sample: unknown): unknown {
  if (typeof sample === "string") return "";
  if (sample && typeof sample === "object" && !Array.isArray(sample)) {
    return Object.fromEntries(Object.entries(sample).map(([key, value]) => [key, blank(value)]));
  }
  return sample;
}

/** Admin save. Field errors are keyed by path, e.g. "faq.items.2.answer". */
export function validateLanding(raw: unknown): Result<LandingContent> {
  const errors: FieldErrors = {};
  const value = normalize(DEFAULT_LANDING, raw, [], errors, "strict") as LandingContent;
  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, value };
}

/** File read. Never fails: missing or broken parts use the defaults. */
export function normalizeLanding(raw: unknown): LandingContent {
  return normalize(DEFAULT_LANDING, raw, [], {}, "lenient") as LandingContent;
}

/** Uploaded files the landing page uses, for upload cleanup. */
export function landingUploads(content: LandingContent): string[] {
  return [content.hero.image?.file, content.product.image?.file].filter(
    (file): file is string => Boolean(file),
  );
}

/** Fills the quote form's WhatsApp template. */
export function fillQuoteTemplate(
  template: string,
  values: { produk: string; ukuran: string; jumlah: string },
): string {
  return template.replace(/\{(produk|ukuran|jumlah)\}/g, (_match, key: keyof typeof values) => values[key]);
}
