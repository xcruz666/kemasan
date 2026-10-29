import type { Metadata } from "next";
import localFont from "next/font/local";
import { uploadUrl } from "@/lib/content/image-ref";
import { getPublicOrigin, getSiteSettings } from "@/lib/content/settings";
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

/**
 * Site-wide fallbacks. Every public page sets its own title, description,
 * canonical URL, and link preview through @/lib/seo.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [{ site, seo }, origin] = await Promise.all([getSiteSettings(), getPublicOrigin()]);
  const favicon = seo.favicon && {
    url: uploadUrl(seo.favicon.file),
    type: seo.favicon.file.endsWith(".png") ? "image/png" : "image/webp",
  };

  return {
    ...(origin && { metadataBase: origin }),
    title: site.siteName,
    description: seo.defaultDescription,
    icons: favicon
      ? // iOS home-screen icons need PNG; a WebP favicon is used for browser tabs only.
        { icon: [favicon], ...(favicon.type === "image/png" && { apple: [favicon] }) }
      : { icon: [{ url: "/icon.svg", type: "image/svg+xml" }] },
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
    openGraph: { type: "website", locale: "id_ID", siteName: site.siteName },
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
