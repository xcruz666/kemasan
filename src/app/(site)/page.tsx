import Image from "next/image";
import { ArrowDown, ArrowUpRight, Layers2, Check, Plus } from "lucide-react";
import Link from "next/link";
import { LandingIcon } from "@/components/landing-icon";
import { Multiline } from "@/components/multiline";
import { ProductCard } from "@/components/product-card";
import { QuoteForm } from "@/components/quote-form";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { whatsappUrl } from "@/lib/brand";
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

/** Card and step numbers are part of the design, not editable content. */
const itemNumber = (index: number) => String(index + 1).padStart(2, "0");

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
  // An empty message falls back to the site-wide default from Pengaturan.
  const whatsappHref = (message: string) =>
    message ? whatsappUrl(whatsapp.phone, message) : defaultWhatsappHref;
  const {
    hero,
    proof,
    benefits,
    product,
    applications,
    steps,
    faq,
    contact,
  } = landing;

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
              <span className="tiny-line" /> {hero.eyebrow}
            </div>
            <h1 id="hero-title">
              <Multiline text={hero.title} />
              {hero.highlight && (
                <>
                  {" "}
                  <span className="fresh-word">
                    {hero.highlight}
                    <svg
                      viewBox="0 0 320 14"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path d="M3 10Q155 0 316 7" />
                    </svg>
                  </span>
                </>
              )}
            </h1>
            <p className="hero-description">
              <Multiline text={hero.description} />
            </p>
            <div className="hero-actions">
              <a
                className="button"
                href={whatsappHref(hero.primaryMessage)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppIcon /> {hero.primaryLabel}
              </a>
              <a className="text-link" href="#produk">
                {hero.secondaryLabel} <ArrowDown size={17} />
              </a>
            </div>
            <div className="hero-footnote">
              <span className="check-circle">
                <Check size={13} />
              </span>{" "}
              {hero.footnotes[0]} <span className="separator" />{" "}
              {hero.footnotes[1]}
            </div>
          </div>
          <div className="hero-visual">
            <Image
              src={heroSrc}
              alt={hero.imageAlt}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 55vw"
              className="hero-image"
              unoptimized={Boolean(hero.image)}
            />
            <div className="image-top-label">
              <span className="label-dot" /> {hero.topLabel}
            </div>
            <div className="material-tag">
              <Layers2 size={23} />
              <span>
                {hero.materialTitle}
                <small>{hero.materialNote}</small>
              </span>
            </div>
            <div className="image-caption">{hero.caption}</div>
            <div className="round-note">
              <span>{hero.roundTop}</span>
              <strong>
                <Multiline text={hero.roundMain} />
              </strong>
              <span>{hero.roundBottom}</span>
            </div>
          </div>
        </section>

        {proof.visible && (
          <section
            className="proof-strip container"
            aria-label="Karakteristik produk"
          >
            {proof.items.map((item, index) => (
              <div key={index}>
                <LandingIcon name={item.icon} />
                <span>
                  {item.text} <strong>{item.strong}</strong>
                </span>
              </div>
            ))}
          </section>
        )}

        {benefits.visible && (
          <section id="keunggulan" className="section container benefits">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{benefits.eyebrow}</p>
                <h2>
                  <Multiline text={benefits.title} />
                </h2>
              </div>
              <p>
                <Multiline text={benefits.description} />
              </p>
            </div>
            <div className="benefit-grid">
              {benefits.cards.map((card, index) => (
                <article key={index}>
                  <span className="feature-icon">
                    <LandingIcon name={card.icon} strokeWidth={1.4} />
                  </span>
                  <h3>{card.title}</h3>
                  <p>
                    <Multiline text={card.text} />
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        {product.visible && (
          <section id="produk" className="product-section">
            <div className="container product-grid">
              <div className="product-photo">
                <Image
                  src={productSrc}
                  alt={product.imageAlt}
                  fill
                  sizes="(max-width: 900px) 100vw, 48vw"
                  unoptimized={Boolean(product.image)}
                />
                <span className="product-photo-label">
                  {product.photoLabel}
                </span>
                <span className="product-photo-note">{product.photoNote}</span>
              </div>
              <div className="product-details">
                <p className="eyebrow">{product.eyebrow}</p>
                <h2>
                  <Multiline text={product.title} />
                </h2>
                <p className="section-description">
                  <Multiline text={product.description} />
                </p>
                <dl className="spec-list">
                  {product.specs.map((spec, index) => (
                    <div key={index}>
                      <dt>{spec.label}</dt>
                      <dd>{spec.value}</dd>
                    </div>
                  ))}
                </dl>
                <a
                  className="text-link product-link"
                  href={whatsappHref(product.linkMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {product.linkLabel} <ArrowUpRight size={19} />
                </a>
              </div>
            </div>
          </section>
        )}

        {landing.featured.visible && featured.length > 0 && (
          <section
            className="section container featured-section"
            aria-labelledby="produk-unggulan-title"
          >
            <div className="section-heading">
              <div>
                <p className="eyebrow">{landing.featured.eyebrow}</p>
                <h2 id="produk-unggulan-title">
                  <Multiline text={landing.featured.title} />
                </h2>
              </div>
              <p>
                <Multiline text={landing.featured.description} />
              </p>
            </div>
            <div className="product-card-grid">
              {featured.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
            <Link className="text-link featured-link" href="/katalog">
              {landing.featured.linkLabel} <ArrowUpRight size={18} />
            </Link>
          </section>
        )}

        {applications.visible && (
          <section className="section container applications">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{applications.eyebrow}</p>
                <h2>
                  <Multiline text={applications.title} />
                </h2>
              </div>
              <a className="text-link" href="#konsultasi">
                {applications.linkLabel} <ArrowUpRight size={18} />
              </a>
            </div>
            <div className="application-grid">
              {applications.cards.map((card, index) => (
                <a
                  className="application-card"
                  href={whatsappHref(card.message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={index}
                >
                  <div className="application-top">
                    <LandingIcon name={card.icon} size={34} strokeWidth={1.2} />
                    <span>{itemNumber(index)}</span>
                  </div>
                  <h3>{card.name}</h3>
                  <p>
                    <Multiline text={card.text} />
                  </p>
                  <span className="application-link">
                    {applications.cardLinkLabel} <ArrowUpRight size={18} />
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}

        {steps.visible && (
          <section id="cara-pesan" className="order-section">
            <div className="container">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">{steps.eyebrow}</p>
                  <h2>
                    <Multiline text={steps.title} />
                  </h2>
                </div>
                <p>
                  <Multiline text={steps.description} />
                </p>
              </div>
              <div className="steps">
                {steps.items.map((step, index) => (
                  <article key={index}>
                    <span className="step-number">{itemNumber(index)}</span>
                    <h3>{step.title}</h3>
                    <p>
                      <Multiline text={step.text} />
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {faq.visible && (
          <section id="faq" className="section container faq-section">
            <div>
              <p className="eyebrow">{faq.eyebrow}</p>
              <h2>
                <Multiline text={faq.title} />
              </h2>
              <p>
                <Multiline text={faq.description} />
              </p>
              <a
                className="text-link"
                href={defaultWhatsappHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {faq.linkLabel} <ArrowUpRight size={18} />
              </a>
            </div>
            <div className="faq-list">
              {faq.items.map((item, index) => (
                <details key={index}>
                  <summary>
                    {item.question}
                    <Plus size={20} />
                  </summary>
                  <p>
                    <Multiline text={item.answer} />
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {contact.visible && (
          <section id="konsultasi" className="contact-section">
            <div className="container contact-grid">
              <div className="contact-copy">
                <p className="eyebrow">{contact.eyebrow}</p>
                <h2>
                  <Multiline text={contact.title} />
                  {contact.highlight && (
                    <>
                      <br />
                      <span>{contact.highlight}</span>
                    </>
                  )}
                </h2>
                <p>
                  <Multiline text={contact.description} />
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
              <QuoteForm phone={whatsapp.phone} form={contact.form} />
            </div>
          </section>
        )}
      </main>
    </>
  );
}
