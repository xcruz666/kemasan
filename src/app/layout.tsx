import type { Metadata } from "next";
import localFont from "next/font/local";
import { brand } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const sans = localFont({
  src: "../../public/fonts/geist-latin.woff2",
  variable: "--font-sans",
  display: "swap",
});
const mono = localFont({
  src: "../../public/fonts/geist-mono-latin.woff2",
  variable: "--font-code",
  display: "swap",
});

const title = "Kantong Vacuum Premium untuk Bisnis | Optima Kemasan Prima";
const description =
  "Jual kantong vacuum premium untuk kebutuhan usaha dan grosir. Material Nylon + LLDPE, ketebalan standar 75 mikron. Konsultasikan ukuran via WhatsApp.";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();

  return {
    title,
    description,
    icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }] },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: brand.name,
      title,
      description,
    },
    twitter: { card: "summary", title, description },
    ...(siteUrl && {
      metadataBase: siteUrl,
      alternates: { canonical: "/" },
      openGraph: {
        type: "website",
        locale: "id_ID",
        url: siteUrl,
        siteName: brand.name,
        title,
        description,
        images: [
          {
            url: "/images/optima-social.jpg",
            width: 1200,
            height: 630,
            alt: "Kantong vacuum premium berisi salmon dan sayuran",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ["/images/optima-social.jpg"],
      },
    }),
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
