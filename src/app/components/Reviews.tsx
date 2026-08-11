"use client";

import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";

// Placeholder sample content — see README "Google Reviews" for the pending
// integration decision (Google Places API vs. third-party widget).
const REVIEWS = [
    { name: "R. Sami", initial: "R", rating: 5, text: "Professional, attentive, and my shoulder pain is finally gone after a few sessions." },
    { name: "L. Haddad", initial: "L", rating: 5, text: "Noor and the team really listen. The post-op program got me back on my feet quickly." },
    { name: "M. Odeh", initial: "M", rating: 4, text: "Clean clinic, friendly staff, and appointments always run on time." },
    { name: "D. Nassar", initial: "D", rating: 5, text: "Best physiotherapy experience I've had in Amman. Highly recommend the sports rehab program." },
];

export default function Reviews() {
    const { t } = useLanguage();
    const [activeIndex, setActiveIndex] = useState(0);
    const active = REVIEWS[activeIndex];

    return (
        <section id="reviews" className="reviews section-padding">
            <div className="container reviews-inner">
                <div className="reviews-header reveal">
                    <div className="section-label" style={{ justifyContent: "center" }}>{t.reviews.label}</div>
                    <h2 className="section-title">{t.reviews.title}</h2>
                    <p className="section-subtitle" style={{ margin: "0 auto" }}>{t.reviews.subtitle}</p>
                </div>

                <div className="reviews-rating-card">
                    <div className="reviews-rating-number">4.9</div>
                    <div>
                        <div className="reviews-rating-stars">★★★★★</div>
                        <div className="reviews-rating-count">{t.reviews.basedOn} 300+ {t.reviews.reviewsWord}</div>
                    </div>
                    <a
                        href="https://www.google.com/search?q=Therapy+Jo+Physiotherapy+Center+reviews"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="reviews-rating-cta"
                    >
                        {t.reviews.cta}
                    </a>
                </div>

                <div className="reviews-spotlight">
                    <div className="reviews-quote-mark">&ldquo;</div>
                    <p className="reviews-quote-text">{active.text}</p>
                    <div className="reviews-attribution">
                        <div className="reviews-avatar">{active.initial}</div>
                        <div className="reviews-attribution-text">
                            <div className="reviews-name">{active.name}</div>
                            <div className="reviews-stars-small">
                                <span className="reviews-stars-filled">{"★".repeat(active.rating)}</span>
                                <span className="reviews-stars-empty">{"★".repeat(5 - active.rating)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="reviews-dots">
                        {REVIEWS.map((r, i) => (
                            <button
                                key={r.name}
                                className={`reviews-dot ${i === activeIndex ? "active" : ""}`}
                                onClick={() => setActiveIndex(i)}
                                aria-label={`Show review from ${r.name}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
