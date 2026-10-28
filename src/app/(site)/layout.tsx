import { ArrowUpRight } from "lucide-react";
import { Footer } from "@/components/footer";
import { Header, type NavLink } from "@/components/header";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { whatsappUrl } from "@/lib/brand";
import { getMenuPages } from "@/lib/content/pages";
import "./site.css";

export const dynamic = "force-dynamic";

const baseLinks: NavLink[] = [
  { label: "Produk", href: "/#produk" },
  { label: "Katalog", href: "/katalog" },
  { label: "Keunggulan", href: "/#keunggulan" },
  { label: "Cara pesan", href: "/#cara-pesan" },
  { label: "FAQ", href: "/#faq" },
];

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const menuPages = await getMenuPages();
  const links: NavLink[] = [
    ...baseLinks,
    ...menuPages.map((page) => ({ label: page.title, href: `/${page.slug}` })),
  ];

  return (
    <>
      <a className="skip-link" href="#main">
        Langsung ke konten
      </a>
      <div className="announcement">
        <span>KEMAS LEBIH BAIK. TUMBUH LEBIH JAUH.</span>
        <a href="/#konsultasi">
          Terbuka untuk pemesanan grosir <ArrowUpRight size={14} />
        </a>
      </div>
      <Header links={links} />
      {children}
      <Footer />
      <a
        className="floating-wa"
        href={whatsappUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Konsultasi melalui WhatsApp"
      >
        <WhatsAppIcon size={25} />
        <span>Chat kami</span>
      </a>
    </>
  );
}
