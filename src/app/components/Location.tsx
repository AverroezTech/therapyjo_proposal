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
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3384.7262024301945!2d35.9076188!3d31.968323799999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151ca1cd2ffd43a7%3A0xcdfa02279a698e81!2sTherapy%20Jo%20Physiotherapy%20Center!5e0!3m2!1sen!2sjo!4v1786726473771!5m2!1sen!2sjo"
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
                    </div>
                </div>
            </div>
        </section>
    );
}
