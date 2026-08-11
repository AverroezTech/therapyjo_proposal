"use client";

import { useLanguage } from "../i18n/LanguageContext";

export default function ContactCTA() {
    const { t } = useLanguage();

    return (
        <section id="contact" className="contact-cta section-padding">
            <div className="container contact-cta-inner">
                <div className="reveal">
                    <div className="section-label">{t.contact.label}</div>
                    <h2 className="section-title">{t.contact.title}</h2>
                    <p className="section-subtitle">{t.contact.subtitle}</p>
                </div>

                <div className="contact-buttons">
                    <a href="https://wa.me/962799819669" target="_blank" rel="noopener noreferrer" className="contact-btn">
                        {t.contact.whatsapp}
                    </a>
                    <a href="tel:+962799819669" className="contact-btn">
                        {t.contact.call}
                    </a>
                    <a href="https://instagram.com/therapyjocenter" target="_blank" rel="noopener noreferrer" className="contact-btn">
                        @therapyjocenter
                    </a>
                </div>
            </div>
        </section>
    );
}
