"use client";

import { useEffect, useState } from "react";
import { Layers2, Menu, X } from "lucide-react";
import { brand } from "@/lib/brand";
import { WhatsAppIcon } from "./whatsapp-icon";

/** external links (https://…) open in a new tab. */
export type NavLink = { label: string; href: string; external?: boolean };

function linkTarget(link: NavLink) {
  return link.external ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

export function Header({
  links,
  whatsappHref,
}: {
  links: NavLink[];
  /** wa.me link with the default message from admin settings. */
  whatsappHref: string;
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
        <a className="brand" href="/" aria-label={`${brand.name}, beranda`}>
          <span className="brand-mark">
            <Layers2 size={29} strokeWidth={1.7} />
          </span>
          <span>
            optima<span className="brand-period">.</span>
            <small>KEMASAN PRIMA</small>
          </span>
        </a>
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
          aria-label="Hubungi Optima Kemasan Prima via WhatsApp"
        >
          <WhatsAppIcon size={19} /> <span>Hubungi kami</span>
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
