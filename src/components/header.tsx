"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { DEFAULT_SITE, type SiteLogo as SiteLogoSettings } from "@/lib/content/settings-shared";
import { SiteLogo } from "./site-logo";
import { WhatsAppIcon } from "./whatsapp-icon";

/** external links (https://…) open in a new tab. */
export type NavLink = { label: string; href: string; external?: boolean };

function linkTarget(link: NavLink) {
  return link.external ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

export function Header({
  links,
  whatsappHref,
  siteName = DEFAULT_SITE.siteName,
  ctaLabel = DEFAULT_SITE.headerCtaLabel,
  logo = DEFAULT_SITE.logo,
}: {
  links: NavLink[];
  /** wa.me link with the default message from admin settings. */
  whatsappHref: string;
  /** Used in aria-labels and the image logo's alt text. */
  siteName?: string;
  ctaLabel?: string;
  logo?: SiteLogoSettings;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <SiteLogo logo={logo} siteName={siteName} />
        <nav className="desktop-nav" aria-label="Navigasi utama">
          {links.map((link, index) => (
            <a key={`${index}-${link.href}`} href={link.href} {...linkTarget(link)}>
              {link.label}
            </a>
          ))}
        </nav>
        <a
          className="button button-small nav-cta"
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Hubungi ${siteName} via WhatsApp`}
        >
          <WhatsAppIcon size={19} /> <span>{ctaLabel}</span>
        </a>
        <button
          className="menu-toggle"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-menu"
          className="mobile-menu"
          aria-label="Navigasi seluler"
        >
          {links.map((link, index) => (
            <a
              key={`${index}-${link.href}`}
              href={link.href}
              {...linkTarget(link)}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
            Hubungi via WhatsApp
          </a>
        </nav>
      )}
    </header>
  );
}
