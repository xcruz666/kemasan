"use client";

import { useEffect, useState } from "react";
import { Layers2, Menu, X } from "lucide-react";
import { brand, whatsappUrl } from "@/lib/brand";
import { WhatsAppIcon } from "./whatsapp-icon";

export type NavLink = { label: string; href: string };

export function Header({ links }: { links: NavLink[] }) {
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
          {links.map(({ label, href }) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <a
          className="button button-small nav-cta"
          href={whatsappUrl()}
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
          {links.map(({ label, href }) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
            Hubungi via WhatsApp
          </a>
        </nav>
      )}
    </header>
  );
}
