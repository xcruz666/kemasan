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
  const { announcement, ...site } = settings.site;

  return (
    <>
      <a className="skip-link" href="#main">
        Langsung ke konten
      </a>
      {announcement.visible && (
        <div className="announcement">
          {announcement.text && <span>{announcement.text}</span>}
          {announcement.linkLabel && announcement.linkHref && (
            <a
              href={announcement.linkHref}
              {...(/^https?:/i.test(announcement.linkHref) && {
                target: "_blank",
                rel: "noopener noreferrer",
              })}
            >
              {announcement.linkLabel} <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      )}
      <Header
        links={links}
        whatsappHref={whatsappHref}
        siteName={site.siteName}
        ctaLabel={site.headerCtaLabel}
      />
      {children}
      <Footer siteName={site.siteName} tagline={site.footer.tagline} bottomText={site.footer.bottomText} />
      <a
        className="floating-wa"
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Konsultasi melalui WhatsApp"
      >
        <WhatsAppIcon size={25} />
        <span>{site.floatingLabel}</span>
      </a>
    </>
  );
}
