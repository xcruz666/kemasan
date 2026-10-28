import { Layers2 } from "lucide-react";
import { brand } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-main">
          <a className="brand" href="/" aria-label={`${brand.name}, beranda`}>
            <span className="brand-mark">
              <Layers2 size={29} strokeWidth={1.7} />
            </span>
            <span>
              optima<span className="brand-period">.</span>
              <small>KEMASAN PRIMA</small>
            </span>
          </a>
          <p>
            Kemasan baik.
            <br />
            Kesegaran terjaga.
          </p>
          <nav aria-label="Navigasi footer">
            <a href="/#produk">Produk</a>
            <a href="/katalog">Katalog</a>
            <a href="/#cara-pesan">Cara pesan</a>
            <a href="/#konsultasi">Hubungi kami</a>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {brand.name}.</span>
          <span>Partner kemasan untuk usaha Anda.</span>
          <a href="#">Kembali ke atas ↑</a>
        </div>
      </div>
    </footer>
  );
}
