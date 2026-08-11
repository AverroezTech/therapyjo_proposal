"use client";

import { useLanguage } from "../i18n/LanguageContext";

export default function Location() {
    const { t } = useLanguage();

    return (
        <section id="location" className="location section-padding">
            <div className="container location-grid">
                <div className="gsap-reveal-left">
                    <div className="location-map">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3384.5!2d35.87!3d31.95!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDU3JzAwLjAiTiAzNcKwNTInMTIuMCJF!5e0!3m2!1sen!2sjo!4v1700000000000"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Therapy Jo Location"
                        ></iframe>
                    </div>
                </div>

                <div className="gsap-reveal-right">
                    <div className="section-label">{t.location.label}</div>
                    <h2 className="section-title">{t.location.title}</h2>
                    <p className="section-subtitle">{t.location.subtitle}</p>

                    <div className="location-block">
                        <div className="location-address-icon">📍</div>
                        <div>
                            <h4>{t.location.addressTitle}</h4>
                            <p>{t.location.addressText}</p>
                        </div>
                    </div>

                    <div className="location-hours">
                        <h4>{t.location.hoursTitle}</h4>
                        <div className="location-hours-item">
                            <span>{t.location.weekdays}</span>
                            <span className="location-hours-value">{t.location.weekdaysTime}</span>
                        </div>
                        <div className="location-hours-item">
                            <span>{t.location.thursday}</span>
                            <span className="location-hours-value">{t.location.thursdayTime}</span>
                        </div>
                        <div className="location-hours-item">
                            <span>{t.location.friday}</span>
                            <span className="location-hours-value">{t.location.fridayTime}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
