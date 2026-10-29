/** Home page structured data; every value comes from Situs & SEO and Halaman Utama. */
export function StructuredData({
  siteUrl,
  telephone,
  siteName,
  pageTitle,
  description,
  images,
  logoUrl,
}: {
  siteUrl: URL;
  /** +62… from admin settings. */
  telephone: string;
  siteName: string;
  /** Full home page title, as in the <title> tag. */
  pageTitle: string;
  description: string;
  /** Root-relative or absolute URLs of the landing photos. */
  images: string[];
  /** Root-relative URL of the uploaded logo; undefined uses the built-in logo. */
  logoUrl?: string;
}) {
  const site = siteUrl.toString();
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site}#organization`,
        name: siteName,
        url: site,
        logo: new URL(logoUrl ?? "/images/optima-logo.svg", siteUrl).toString(),
        telephone,
        contactPoint: {
          "@type": "ContactPoint",
          telephone,
          contactType: "sales",
          availableLanguage: "Indonesian",
          url: `${site}#konsultasi`,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${site}#website`,
        url: site,
        name: siteName,
        inLanguage: "id-ID",
        publisher: { "@id": `${site}#organization` },
      },
      {
        "@type": "WebPage",
        "@id": `${site}#webpage`,
        url: site,
        name: pageTitle,
        description,
        inLanguage: "id-ID",
        isPartOf: { "@id": `${site}#website` },
        ...(images.length > 0 && {
          primaryImageOfPage: new URL(images[0], siteUrl).toString(),
          image: images.map((image) => new URL(image, siteUrl).toString()),
        }),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, "\\u003c"),
      }}
    />
  );
}
