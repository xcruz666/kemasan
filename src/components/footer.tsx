import { Layers2 } from "lucide-react";
import { DEFAULT_SITE } from "@/lib/content/settings-shared";
import { Multiline } from "./multiline";

/** Texts come from Situs & SEO; the logo and footer navigation are fixed design. */
export function Footer({
  siteName = DEFAULT_SITE.siteName,
  tagline = DEFAULT_SITE.footer.tagline,
  bottomText = DEFAULT_SITE.footer.bottomText,
}: {
  siteName?: string;
  /** "\n" becomes a line break. */
  tagline?: string;
  bottomText?: string;
}) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-main">
          <a className="brand" href="/" aria-label={`${siteName}, beranda`}>
            <span className="brand-mark">
              <Layers2 size={29} strokeWidth={1.7} />
            </span>
            <span>
              optima<span className="brand-period">.</span>
              <small>KEMASAN PRIMA</small>
            </span>
          </a>
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
