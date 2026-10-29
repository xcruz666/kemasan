import Image from "next/image";
import {
  ArrowDown,
  ArrowUpRight,
  Layers2,
  Check,
  Snowflake,
  Package,
  ShieldCheck,
  Factory,
  Ruler,
  Fish,
  Beef,
  Carrot,
  Utensils,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { QuoteForm } from "@/components/quote-form";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { brand, whatsappUrl } from "@/lib/brand";
import { getFeaturedProducts } from "@/lib/content/products";
import { getLanding } from "@/lib/content/landing";
import {
  DEFAULT_HERO_IMAGE,
  DEFAULT_PRODUCT_IMAGE,
} from "@/lib/content/landing-shared";
import { uploadUrl } from "@/lib/content/image-ref";
import {
  getPublicOrigin,
  getSiteSettings,
  toWhatsappContact,
} from "@/lib/content/settings";
import { builtInPageMetadata, fullTitle } from "@/lib/seo";
import { StructuredData } from "@/app/structured-data";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return builtInPageMetadata("home", "/");
}

const applications = [
  {
    icon: Beef,
    name: "Daging & unggas",
    text: "Dari potongan segar hingga stok beku, kemas dengan lebih rapat.",
    number: "01",
  },
  {
    icon: Fish,
    name: "Ikan & seafood",
    text: "Kemasan jernih yang memperlihatkan kualitas produk Anda.",
    number: "02",
  },
  {
    icon: Carrot,
    name: "Sayur & buah",
    text: "Porsi lebih rapi untuk persiapan bahan dan kebutuhan distribusi.",
    number: "03",
  },
  {
    icon: Utensils,
    name: "Produk olahan",
    text: "Untuk sosis, bakso, dan berbagai produk siap diolah.",
    number: "04",
  },
];
const faqs = [
  [
    "Apakah ukuran dan ketebalannya bisa disesuaikan?",
    "Bisa. Selain ketebalan standar 75 mikron, Anda dapat mendiskusikan ukuran dan ketebalan sesuai produk yang dikemas. Kirim kebutuhan melalui WhatsApp untuk konfirmasi pilihan dan ketersediaannya.",
  ],
  [
    "Berapa harga dan minimum pemesanannya?",
    "Harga dan minimum pemesanan menyesuaikan ukuran, ketebalan, dan jumlah kebutuhan. Hubungi kami dengan detail tersebut agar tim dapat memberikan penawaran yang sesuai.",
  ],
  [
    "Apakah cocok untuk mesin vacuum saya?",
    "Kecocokan kantong bergantung pada jenis mesin dan permukaan kantong yang dibutuhkan. Sampaikan merek atau tipe mesin Anda saat konsultasi agar kami dapat membantu memastikan kecocokannya sebelum pemesanan.",
  ],
  [
    "Apakah kantong ini bisa digunakan untuk produk beku?",
    "Kantong vacuum dapat membantu melindungi produk selama penyimpanan beku bila proses pengemasan dan penyimpanannya tepat. Informasikan jenis produk serta kondisi penyimpanan Anda untuk rekomendasi kemasan.",
  ],
  [
    "Bagaimana proses pemesanan dan pengirimannya?",
    "Kirim kebutuhan produk, ukuran, dan jumlah melalui WhatsApp. Setelah spesifikasi, harga, serta ketersediaan disepakati, tim akan mengonfirmasi pembayaran, jadwal, dan biaya pengiriman ke alamat Anda.",
  ],
];

export default async function Home() {
  const [featured, settings, landing, siteUrl] = await Promise.all([
    getFeaturedProducts(6),
    getSiteSettings(),
    getLanding(),
    getPublicOrigin(),
  ]);
  const homeSeo = settings.seo.pages.home;
  const pageTitle = await fullTitle(homeSeo.title);
  const heroSrc = landing.hero.image
    ? uploadUrl(landing.hero.image.file)
    : DEFAULT_HERO_IMAGE;
  const productSrc = landing.product.image
    ? uploadUrl(landing.product.image.file)
    : DEFAULT_PRODUCT_IMAGE;
  const whatsapp = toWhatsappContact(settings.whatsapp);
  const defaultWhatsappHref = whatsappUrl(whatsapp.phone, whatsapp.defaultMessage);

  return (
    <>
      {siteUrl && (
        <StructuredData
          siteUrl={siteUrl}
          telephone={whatsapp.international}
          siteName={settings.site.siteName}
          pageTitle={pageTitle}
          description={homeSeo.description}
          images={[heroSrc, productSrc]}
        />
      )}
      <main id="main">
        <section className="hero container" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow hero-eyebrow">
              <span className="tiny-line" /> PARTNER KEMASAN BISNIS ANDA
            </div>
            <h1 id="hero-title">
              Yang segar,
              <br />
              tetap{" "}
              <span className="fresh-word">
                segar.
                <svg
                  viewBox="0 0 320 14"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M3 10Q155 0 316 7" />
                </svg>
              </span>
            </h1>
            <p className="hero-description">
              Kantong vacuum premium untuk menjaga kualitas produk. Dari dapur
              usaha hingga kebutuhan industri.
            </p>
            <div className="hero-actions">
              <a
                className="button"
                href={defaultWhatsappHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon /> Tanya harga grosir
              </a>
              <a className="text-link" href="#produk">
                Kenali produknya <ArrowDown size={17} />
              </a>
            </div>
            <div className="hero-footnote">
              <span className="check-circle">
                <Check size={13} />
              </span>{" "}
              Ukuran fleksibel <span className="separator" /> Pasokan langsung
              dari pabrik
            </div>
          </div>
          <div className="hero-visual">
            <Image
              src="/images/vacuum-food.webp"
              alt="Ilustrasi salmon dan brokoli di dalam kantong vacuum bening"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 55vw"
              className="hero-image"
            />
            <div className="image-top-label">
              <span className="label-dot" /> KESEGARAN, TERBUNGKUS RAPI.
            </div>
            <div className="material-tag">
              <Layers2 size={23} />
              <span>
                Jernih. Rapat. Kuat.<small>NYLON + LLDPE</small>
              </span>
            </div>
            <div className="image-caption">Ilustrasi penggunaan produk</div>
            <div className="round-note">
              <span>DIBUAT UNTUK</span>
              <strong>
                lebih
                <br />
                terjaga.
              </strong>
              <span>SETIAP HARI</span>
            </div>
          </div>
        </section>

        <section
          className="proof-strip container"
          aria-label="Karakteristik produk"
        >
          <div>
            <ShieldCheck />
            <span>
              Material <strong>food grade</strong>
            </span>
          </div>
          <div>
            <Layers2 />
            <span>
              Ketebalan <strong>75 mikron</strong>
            </span>
          </div>
          <div>
            <Ruler />
            <span>
              Ukuran <strong>sesuai kebutuhan</strong>
            </span>
          </div>
          <div>
            <Factory />
            <span>
              Dukungan <strong>skala industri</strong>
            </span>
          </div>
        </section>

        <section id="keunggulan" className="section container benefits">
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 / LEBIH DARI SEKADAR PLASTIK</p>
              <h2>
                Produk Anda berharga.
                <br />
                Kemas dengan semestinya.
              </h2>
            </div>
            <p>
              Di balik produk yang baik, ada kemasan yang bekerja dengan baik.
              Sampai ke tangan pelanggan.
            </p>
          </div>
          <div className="benefit-grid">
            <article>
              <span className="feature-icon">
                <ShieldCheck strokeWidth={1.4} />
              </span>
              <h3>Kesegaran lebih terjaga</h3>
              <p>
                Kemasan rapat membantu mengurangi kontak dengan udara dan
                menjaga kualitas produk selama penyimpanan.
              </p>
            </article>
            <article>
              <span className="feature-icon">
                <Snowflake strokeWidth={1.4} />
              </span>
              <h3>Siap masuk freezer</h3>
              <p>
                Membantu melindungi produk dari freezer burn, dengan proses
                vacuum dan penyimpanan yang tepat.
              </p>
            </article>
            <article>
              <span className="feature-icon">
                <Package strokeWidth={1.4} />
              </span>
              <h3>Ruang lebih efisien</h3>
              <p>
                Tanpa udara berlebih. Produk lebih ringkas, mudah ditata, dan
                memaksimalkan ruang penyimpanan Anda.
              </p>
            </article>
          </div>
        </section>

        <section id="produk" className="product-section">
          <div className="container product-grid">
            <div className="product-photo">
              <Image
                src="/images/vacuum-pouches.webp"
                alt="Ilustrasi tumpukan kantong vacuum transparan dengan tepi tersegel"
                fill
                sizes="(max-width: 900px) 100vw, 48vw"
              />
              <span className="product-photo-label">
                KANTONG VACUUM / SERI PREMIUM
              </span>
              <span className="product-photo-note">Ilustrasi produk</span>
            </div>
            <div className="product-details">
              <p className="eyebrow">02 / KENALI KEMASAN ANDA</p>
              <h2>
                Sederhana bentuknya.
                <br />
                Serius kualitasnya.
              </h2>
              <p className="section-description">
                Kantong vacuum bening dengan komposisi material premium.
                Dirancang untuk kebutuhan pengemasan usaha Anda.
              </p>
              <dl className="spec-list">
                <div>
                  <dt>Material</dt>
                  <dd>Nylon + LLDPE</dd>
                </div>
                <div>
                  <dt>Ketebalan standar</dt>
                  <dd>75 mikron</dd>
                </div>
                <div>
                  <dt>Tampilan</dt>
                  <dd>Bening / transparan</dd>
                </div>
                <div>
                  <dt>Pilihan ukuran</dt>
                  <dd>Sesuai kebutuhan</dd>
                </div>
                <div>
                  <dt>Ketebalan lainnya</dt>
                  <dd>Tersedia sesuai konsultasi</dd>
                </div>
              </dl>
              <a
                className="text-link product-link"
                href={whatsappUrl(
                  whatsapp.phone,
                  `Halo ${brand.name}, saya ingin konsultasi ukuran dan ketebalan kantong vacuum yang cocok untuk produk dan mesin saya.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                Temukan ukuran yang pas <ArrowUpRight size={19} />
              </a>
            </div>
          </div>
        </section>

        {featured.length > 0 && (
          <section
            className="section container featured-section"
            aria-labelledby="produk-unggulan-title"
          >
            <div className="section-heading">
              <div>
                <p className="eyebrow">PRODUK UNGGULAN</p>
                <h2 id="produk-unggulan-title">
                  Pilihan kemasan
                  <br />
                  untuk usaha Anda.
                </h2>
              </div>
              <p>
                Lihat detail ukuran, spesifikasi, dan harga, lalu tanyakan
                ketersediaannya langsung ke tim kami.
              </p>
            </div>
            <div className="product-card-grid">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <Link className="text-link featured-link" href="/katalog">
              Lihat semua produk <ArrowUpRight size={18} />
            </Link>
          </section>
        )}

        <section className="section container applications">
          <div className="section-heading">
            <div>
              <p className="eyebrow">03 / SATU KEMASAN, BANYAK KEBUTUHAN</p>
              <h2>
                Apapun usaha Anda,
                <br />
                kami bantu kemas.
              </h2>
            </div>
            <a className="text-link" href="#konsultasi">
              Diskusikan kebutuhan Anda <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="application-grid">
            {applications.map(({ icon: Icon, name, text, number }) => (
              <a
                className="application-card"
                href={whatsappUrl(
                  whatsapp.phone,
                  `Halo ${brand.name}, saya ingin konsultasi kantong vacuum untuk ${name.toLowerCase()}. Mohon rekomendasi ukuran dan penawaran harganya.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                key={name}
              >
                <div className="application-top">
                  <Icon size={34} strokeWidth={1.2} />
                  <span>{number}</span>
                </div>
                <h3>{name}</h3>
                <p>{text}</p>
                <span className="application-link">
                  Konsultasi kemasan <ArrowUpRight size={18} />
                </span>
              </a>
            ))}
          </div>
        </section>

        <section id="cara-pesan" className="order-section">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">04 / DARI KEBUTUHAN JADI PESANAN</p>
                <h2>
                  Pesan dengan mudah.
                  <br />
                  Kami bantu sampai pas.
                </h2>
              </div>
              <p>
                Komunikasi langsung, supaya kemasan yang Anda pesan benar-benar
                sesuai kebutuhan.
              </p>
            </div>
            <div className="steps">
              {[
                [
                  "01",
                  "Ceritakan kebutuhan",
                  "Sampaikan jenis produk, ukuran kemasan, dan perkiraan jumlah pesanan.",
                ],
                [
                  "02",
                  "Dapatkan penawaran",
                  "Kami bantu sesuaikan spesifikasi dan berikan penawaran untuk bisnis Anda.",
                ],
                [
                  "03",
                  "Konfirmasi & siapkan",
                  "Sepakati detail pesanan dan pengiriman bersama tim kami melalui WhatsApp.",
                ],
              ].map(([number, title, desc]) => (
                <article key={number}>
                  <span className="step-number">{number}</span>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="section container faq-section">
          <div>
            <p className="eyebrow">05 / SEBELUM ANDA MEMESAN</p>
            <h2>
              Masih ada
              <br />
              pertanyaan?
            </h2>
            <p>
              Kami siap membantu Anda
              <br />
              memilih kemasan yang tepat.
            </p>
            <a
              className="text-link"
              href={defaultWhatsappHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              Tanya langsung ke tim kami <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="faq-list">
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <Plus size={20} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="konsultasi" className="contact-section">
          <div className="container contact-grid">
            <div className="contact-copy">
              <p className="eyebrow">KEMASAN TEPAT. BISNIS SIAP.</p>
              <h2>
                Mari kemas
                <br />
                hal baik
                <br />
                <span>berikutnya.</span>
              </h2>
              <p>
                Mulai dengan cerita tentang produk Anda.
                <br />
                Biar kami bantu urusan kemasannya.
              </p>
              <a
                className="contact-number"
                href={defaultWhatsappHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon size={23} />
                {whatsapp.display}
              </a>
            </div>
            <QuoteForm phone={whatsapp.phone} />
          </div>
        </section>
      </main>
    </>
  );
}
