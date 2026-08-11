"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../i18n/LanguageContext";

export default function Footer() {
    const { t } = useLanguage();
    const currentYear = new Date().getFullYear();

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (typeof window !== "undefined" && window.location.pathname !== "/") return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-inner">
                    <div className="footer-brand">
                        <Image src="/logo.jpg" alt="Therapy Jo" width={120} height={38} className="footer-brand-logo" loading="lazy" />
                        <p>{t.footer.description}</p>
                    </div>

                    <div className="footer-column">
                        <h4>{t.footer.quickLinks}</h4>
                        <Link href="/#about" onClick={(e) => handleNavClick(e, "#about")}>{t.footer.aboutUs}</Link>
                        <Link href="/#doctors" onClick={(e) => handleNavClick(e, "#doctors")}>{t.nav.doctors}</Link>
                        <Link href="/blog">{t.footer.blog}</Link>
                        <Link href="/#location" onClick={(e) => handleNavClick(e, "#location")}>{t.footer.location}</Link>
                    </div>

                    <div className="footer-column">
                        <h4>{t.footer.servicesTitle}</h4>
                        {t.services.items.map((item, i) => (
                            <Link key={i} href="/#services" onClick={(e) => handleNavClick(e, "#services")}>
                                {item.title}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="footer-bottom">
                    <span>&copy; {currentYear} {t.footer.copyright}</span>
                    <div className="footer-social">
                        <a href="https://instagram.com/therapyjocenter" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer-social-link">IG</a>
                        <a href="https://wa.me/962799819669" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="footer-social-link">WA</a>
                        <a href="https://www.facebook.com/noorphysicaltherapy/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="footer-social-link">FB</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
