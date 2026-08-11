"use client";

import Image from "next/image";
import { useLanguage } from "../i18n/LanguageContext";

export default function Hero() {
    const { t } = useLanguage();

    return (
        <section id="hero" className="hero">
            <Image
                src="/joint-manipulation.webp"
                alt=""
                fill
                priority
                sizes="100vw"
                className="hero-bg-image"
            />
            <div className="hero-scrim"></div>

            <div className="hero-content">
                <div className="hero-rule"></div>
                <div className="hero-badge">{t.hero.badge}</div>

                <h1 className="hero-title">
                    {t.hero.title}
                    <br />
                    <span className="hero-title-highlight">{t.hero.titleHighlight}</span> {t.hero.titleEnd}
                </h1>

                <p className="hero-subtitle">{t.hero.subtitle}</p>

                <div className="hero-actions">
                    <a href="https://wa.me/962799819669" target="_blank" rel="noopener noreferrer" className="btn-primary">
                        {t.hero.bookSession}
                    </a>
                    <a href="tel:+962799819669" className="btn-secondary">
                        {t.hero.callUs}
                    </a>
                </div>
            </div>
        </section>
    );
}
