"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, FileText, LayoutDashboard, Package, Tags } from "lucide-react";

const links = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/admin/produk", label: "Produk", icon: Package },
  { href: "/admin/kategori", label: "Kategori", icon: Tags },
  { href: "/admin/halaman", label: "Halaman", icon: FileText },
];

export function AdminNav() {
  const pathname = usePathname();
  const isCurrent = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="admin-nav" aria-label="Navigasi admin">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="admin-nav-link"
          aria-current={isCurrent(href) ? "page" : undefined}
        >
          <Icon size={18} aria-hidden="true" />
          <span>{label}</span>
        </Link>
      ))}
      <a className="admin-nav-link" href="/" target="_blank" rel="noopener noreferrer">
        <ExternalLink size={18} aria-hidden="true" />
        <span>Lihat situs</span>
      </a>
    </nav>
  );
}
