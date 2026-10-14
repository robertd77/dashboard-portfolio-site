"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import styles from "./site-navigation.module.css";

type Variant = "home" | "northwood";

type NavigationLink = { href: string; label: string; contact?: boolean };

const links: Record<Variant, NavigationLink[]> = {
  home: [
    { href: "/#services", label: "Services" },
    { href: "/#work", label: "Featured work" },
    { href: "/raw-data", label: "Demo" },
    { href: "/#approach", label: "How it works" },
    { href: "/#contact", label: "Get in touch", contact: true },
  ],
  northwood: [
    { href: "/", label: "Home" },
    { href: "/case-study", label: "Case study" },
    { href: "/raw-data", label: "Raw Data" },
    { href: "/process", label: "Process & Validate" },
    { href: "/dashboard", label: "Dashboard" },
  ],
};

export function SiteNavigation({ variant }: { variant: Variant }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const items = links[variant];

  return (
    <div className={`${styles.navigation} ${variant === "home" ? styles.dark : styles.light}`}>
      <nav className={styles.desktop} aria-label="Main navigation">
        {items.filter((item) => variant === "home" || item.href === "/" || item.href === "/case-study").map((item) => (
          <Link key={item.href} href={item.href} className={item.contact ? styles.contact : undefined} aria-current={pathname === item.href ? "page" : undefined}>
            {item.label}{item.contact && <ArrowUpRight size={13} aria-hidden="true" />}
          </Link>
        ))}
      </nav>
      <button type="button" className={styles.toggle} aria-expanded={open} aria-controls={`site-mobile-menu-${variant}`} aria-label={open ? "Close navigation menu" : "Open navigation menu"} onClick={() => setOpen((value) => !value)}>
        {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
      </button>
      <nav id={`site-mobile-menu-${variant}`} className={`${styles.mobile} ${open ? styles.open : ""}`} aria-label="Mobile navigation" hidden={!open}>
        {items.map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={item.contact ? styles.contact : undefined} aria-current={pathname === item.href ? "page" : undefined}>
            {item.label}{item.contact && <ArrowUpRight size={14} aria-hidden="true" />}
          </Link>
        ))}
      </nav>
    </div>
  );
}
