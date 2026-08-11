"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../i18n/LanguageContext";

export default function Navbar() {
    const { t, lang, toggleLang } = useLanguage();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    // On the homepage, intercept and smooth-scroll in place. Anywhere else,
    // let the Link do a normal client-side transition to "/#id" — Next.js
    // scrolls to the matching id once the homepage has mounted.
    const handleAnchorClick = useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
            setMobileOpen(false);
            if (pathname !== "/") return;
            e.preventDefault();
            document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
        },
        [pathname]
    );

    const desktopLinks = [
        { href: "/#about", label: t.nav.about },
        { href: "/#services", label: t.nav.services },
        { href: "/#doctors", label: t.nav.doctors },
        { href: "/blog", label: t.nav.blog },
        { href: "/#reviews", label: t.nav.reviews },
        { href: "/#location", label: t.nav.location },
        { href: "/#contact", label: t.nav.contact },
    ];

    const mobileLinks = [
        { href: "/#about", label: t.nav.about },
        { href: "/#services", label: t.nav.services },
        { href: "/#finder", label: t.finder.title },
        { href: "/#doctors", label: t.nav.doctors },
        { href: "/blog", label: t.nav.blog },
        { href: "/#reviews", label: t.nav.reviews },
        { href: "/#location", label: t.nav.location },
        { href: "/#contact", label: t.nav.contact },
    ];

    const renderLink = (link: { href: string; label: string }) => {
        // Real routes (e.g. /blog) always navigate normally — no scroll interception.
        if (!link.href.includes("#")) {
            return (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                    {link.label}
                </Link>
            );
        }
        const id = link.href.slice(link.href.indexOf("#"));
        return (
            <Link key={link.href} href={link.href} onClick={(e) => handleAnchorClick(e, id)}>
                {link.label}
            </Link>
        );
    };

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link href="/" className="navbar-logo-link" onClick={(e) => handleAnchorClick(e, "#hero")}>
                    <Image src="/logo.jpg" alt="Therapy Jo" width={120} height={40} className="navbar-logo" priority />
                </Link>

                <div className="navbar-links">
                    {desktopLinks.map(renderLink)}
                </div>

                <div className="navbar-actions">
                    <button
                        className={`hamburger ${mobileOpen ? "active" : ""}`}
                        onClick={() => setMobileOpen((v) => !v)}
                        aria-label="Toggle Menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                    <button className="lang-toggle" onClick={toggleLang} aria-label="Toggle Language">
                        {lang === "en" ? "عربي" : "EN"}
                    </button>
                    <a href="https://wa.me/962799819669" target="_blank" rel="noopener noreferrer" className="navbar-cta">
                        {t.nav.bookNow}
                    </a>
                </div>
            </div>

            {mobileOpen && (
                <div className="mobile-panel">
                    {mobileLinks.map(renderLink)}
                </div>
            )}
        </nav>
    );
}
