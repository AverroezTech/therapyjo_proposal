"use client";

import { useLanguage } from "../i18n/LanguageContext";

export default function Marquee() {
    const { t } = useLanguage();

    const tickerText =
        [
            t.hero.badge,
            `${t.about.stat1Number} ${t.about.stat1Label}`,
            `${t.about.stat2Number} ${t.about.stat2Label}`,
            `${t.about.stat3Number} ${t.about.stat3Label}`,
            t.tagline,
        ].join("   •   ") + "   •   ";

    return (
        <div className="marquee">
            <div className="marquee-track">
                <span className="marquee-text">{tickerText}</span>
                <span className="marquee-text">{tickerText}</span>
            </div>
        </div>
    );
}
