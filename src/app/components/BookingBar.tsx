"use client";

import { useLanguage } from "../i18n/LanguageContext";

export default function BookingBar({ visible }: { visible: boolean }) {
    const { t } = useLanguage();

    return (
        <div className={`book-bar ${visible ? "visible" : ""}`}>
            <div className="book-bar-inner">
                <div className="book-bar-text">
                    <span className="book-bar-title">{t.bookBar.title}</span>
                    <span className="book-bar-slot">{t.bookBar.slot}</span>
                </div>
                <div className="book-bar-actions">
                    <a href="tel:+962799819669" className="book-bar-call">{t.hero.callUs}</a>
                    <a href="https://wa.me/962799819669" target="_blank" rel="noopener noreferrer" className="book-bar-book">
                        {t.nav.bookNow}
                    </a>
                </div>
            </div>
        </div>
    );
}
