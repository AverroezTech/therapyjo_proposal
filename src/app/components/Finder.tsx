"use client";

import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";

const ICONS = [
    "/icons/cold-laser.png",
    "/icons/radio-frequency.png",
    "/icons/pelvic-floor.png",
    "/icons/electromagnetic.png",
    "/icons/traction.png",
    "/icons/sport-rehab.png",
    "/icons/post-op.png",
    "/icons/pediatric.png",
    "/icons/dry-needling.png",
];

export default function Finder() {
    const { t, dir } = useLanguage();
    const [activeIndex, setActiveIndex] = useState(0);

    const areas = t.finder.areas;
    const activeArea = areas[activeIndex];
    const arrow = dir === "rtl" ? "←" : "→";

    const treatments = activeArea.serviceIndexes
        .map((si) => t.services.items[si])
        .filter(Boolean)
        .map((svc, i) => ({
            ...svc,
            icon: ICONS[activeArea.serviceIndexes[i]],
            categoryLabel: t.services.categories[svc.category as keyof typeof t.services.categories],
        }));

    return (
        <section id="finder" className="finder section-padding">
            <div className="container finder-inner">
                <div className="finder-header reveal">
                    <div className="section-label" style={{ justifyContent: "center" }}>{t.finder.label}</div>
                    <h2 className="section-title">{t.finder.title}</h2>
                    <p className="section-subtitle" style={{ margin: "0 auto" }}>{t.finder.subtitle}</p>
                </div>

                <div className="finder-grid">
                    <div className="finder-areas">
                        {areas.map((area, i) => (
                            <button
                                key={area.name}
                                className={`finder-area-btn ${i === activeIndex ? "active" : ""}`}
                                onClick={() => setActiveIndex(i)}
                            >
                                <span>{area.name}</span>
                                {i === activeIndex && <span className="finder-area-arrow">{arrow}</span>}
                            </button>
                        ))}
                    </div>

                    <div className="finder-panel">
                        <div className="finder-panel-eyebrow">{t.finder.recommendedFor}</div>
                        <h3 className="finder-panel-title">{activeArea.name}</h3>
                        <p className="finder-panel-note">{activeArea.note}</p>

                        <div className="finder-treatments">
                            {treatments.map((tr) => (
                                <div className="finder-treatment-row" key={tr.title}>
                                    <div className="finder-treatment-icon">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={tr.icon} alt="" loading="lazy" decoding="async" />
                                    </div>
                                    <div>
                                        <div className="finder-treatment-title">{tr.title}</div>
                                        <div className="finder-treatment-category">{tr.categoryLabel}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <a href="https://wa.me/962799819669" target="_blank" rel="noopener noreferrer" className="finder-cta">
                            {t.finder.cta}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
