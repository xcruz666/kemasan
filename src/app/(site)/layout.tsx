import { ArrowUpRight } from "lucide-react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { whatsappUrl } from "@/lib/brand";
import { getPublishedPages } from "@/lib/content/pages";
import { getSiteSettings, resolveHeaderMenu } from "@/lib/content/settings";
import "./site.css";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [settings, pages] = await Promise.all([getSiteSettings(), getPublishedPages()]);
  const links = resolveHeaderMenu(settings.headerMenu, pages);
  const whatsappHref = whatsappUrl(settings.whatsapp.phone, settings.whatsapp.defaultMessage);

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
      <Header links={links} whatsappHref={whatsappHref} />
      {children}
      <Footer />
      <a
        className="floating-wa"
        href={whatsappHref}
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
