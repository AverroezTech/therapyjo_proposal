"use client";

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

export default function Services() {
    const { t } = useLanguage();

    return (
        <section id="services" className="svc section-padding">
            <div className="container svc-inner">
                <div className="svc-header reveal">
                    <div className="section-label" style={{ justifyContent: "center" }}>{t.services.label}</div>
                    <h2 className="section-title">{t.services.title}</h2>
                    <p className="section-subtitle" style={{ margin: "0 auto" }}>{t.services.subtitle}</p>
                </div>

                <div className="svc-list">
                    {t.services.items.map((svc, i) => (
                        <div className="svc-row" key={svc.title}>
                            <div className="svc-row-num">{String(i + 1).padStart(2, "0")}</div>
                            <div className="svc-row-icon">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={ICONS[i]} alt="" loading="lazy" decoding="async" />
                            </div>
                            <div className="svc-row-content">
                                <h3 className="svc-row-title">{svc.title}</h3>
                                <p className="svc-row-desc">{svc.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
