import { DEFAULT_SITE, type SiteLogo as SiteLogoSettings } from "@/lib/content/settings-shared";
import { Multiline } from "./multiline";
import { SiteLogo } from "./site-logo";

/** Texts and logo come from Situs & SEO; the footer navigation is fixed design. */
export function Footer({
  siteName = DEFAULT_SITE.siteName,
  tagline = DEFAULT_SITE.footer.tagline,
  bottomText = DEFAULT_SITE.footer.bottomText,
  logo = DEFAULT_SITE.logo,
}: {
  siteName?: string;
  logo?: SiteLogoSettings;
  /** "\n" becomes a line break. */
  tagline?: string;
  bottomText?: string;
}) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-main">
          <SiteLogo logo={logo} siteName={siteName} />
          <p>
            <Multiline text={tagline} />
          </p>
          <nav aria-label="Navigasi footer">
            <a href="/#produk">Produk</a>
            <a href="/katalog">Katalog</a>
            <a href="/#cara-pesan">Cara pesan</a>
            <a href="/#konsultasi">Hubungi kami</a>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {siteName}.</span>
          <span>{bottomText}</span>
          <a href="#">Kembali ke atas ↑</a>
        </div>
      </div>
    </footer>
  );
}
