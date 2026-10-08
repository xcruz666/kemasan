import { brand } from "@/lib/brand";

export function StructuredData({ siteUrl }: { siteUrl: URL }) {
  const site = siteUrl.toString();
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site}#organization`,
        name: brand.name,
        url: site,
        logo: `${site}images/optima-logo.svg`,
        telephone: brand.phoneInternational,
        contactPoint: {
          "@type": "ContactPoint",
          telephone: brand.phoneInternational,
          contactType: "sales",
          availableLanguage: "Indonesian",
          url: `${site}#konsultasi`,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${site}#website`,
        url: site,
        name: brand.name,
        inLanguage: "id-ID",
        publisher: { "@id": `${site}#organization` },
      },
      {
        "@type": "WebPage",
        "@id": `${site}#webpage`,
        url: site,
        name: "Kantong Vacuum Premium untuk Bisnis | Optima Kemasan Prima",
        inLanguage: "id-ID",
        isPartOf: { "@id": `${site}#website` },
        mainEntity: {
          "@type": "Product",
          name: "Kantong Vacuum Premium",
          description:
            "Kantong vacuum transparan berbahan Nylon + LLDPE, ketebalan standar 75 mikron. Ukuran dan ketebalan lain dapat dikonsultasikan.",
          image: [
            `${site}images/vacuum-food.webp`,
            `${site}images/vacuum-pouches.webp`,
          ],
          category: "Kantong plastik vacuum untuk kemasan makanan",
          material: "Nylon + LLDPE",
          brand: {
            "@type": "Brand",
            name: brand.name,
          },
        },
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
