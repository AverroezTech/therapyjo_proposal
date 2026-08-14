"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";

interface Review {
    id: string;
    author: string;
    rating: number;
    text: string;
    truncated: boolean;
    relativeTime: string;
    url: string;
}

interface ReviewsPayload {
    available: boolean;
    rating?: number;
    userRatingCount?: number;
    googleMapsUri?: string;
    reviews?: Review[];
}

const GOOGLE_SEARCH_FALLBACK =
    "https://www.google.com/search?q=Therapy+Jo+Physiotherapy+Center+reviews";

export default function Reviews() {
    const { t } = useLanguage();
    const [data, setData] = useState<ReviewsPayload | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        fetch("/api/public/reviews")
            .then((res) => (res.ok ? res.json() : { available: false }))
            .then(setData)
            .catch(() => setData({ available: false }));
    }, []);

    const reviews = data?.reviews ?? [];
    const active = reviews[activeIndex];
    const hasRating = data?.available === true && typeof data.rating === "number";
    const filledStars = hasRating ? Math.round(data!.rating!) : 0;
    const ctaUrl = data?.googleMapsUri || GOOGLE_SEARCH_FALLBACK;

    return (
        <section id="reviews" className="reviews section-padding">
            <div className="container reviews-inner">
                <div className="reviews-header reveal">
                    <div className="section-label" style={{ justifyContent: "center" }}>{t.reviews.label}</div>
                    <h2 className="section-title">{t.reviews.title}</h2>
                    <p className="section-subtitle" style={{ margin: "0 auto" }}>{t.reviews.subtitle}</p>
                </div>

                {data && (
                    <div className={`reviews-rating-card${hasRating ? "" : " is-unavailable"}`}>
                        {hasRating && (
                            <>
                                <div className="reviews-rating-number">{data!.rating!.toFixed(1)}</div>
                                <div>
                                    <div className="reviews-rating-stars">
                                        {"★".repeat(filledStars)}
                                        <span className="reviews-stars-empty">{"★".repeat(5 - filledStars)}</span>
                                    </div>
                                    <div className="reviews-rating-count">
                                        {t.reviews.basedOn} {data!.userRatingCount} {t.reviews.reviewsWord}
                                    </div>
                                </div>
                            </>
                        )}
                        <a
                            href={ctaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="reviews-rating-cta"
                        >
                            {t.reviews.cta}
                        </a>
                    </div>
                )}

                {active && (
                    <div className="reviews-spotlight">
                        <div className="reviews-quote-mark">&ldquo;</div>
                        <p className="reviews-quote-text" dir="auto">{active.text}</p>
                        {active.truncated && active.url && (
                            <p className="reviews-quote-more">
                                <a href={active.url} target="_blank" rel="noopener noreferrer">
                                    {t.reviews.readFull}
                                </a>
                            </p>
                        )}
                        <div className="reviews-attribution">
                            <div className="reviews-avatar">{active.author.charAt(0).toUpperCase()}</div>
                            <div className="reviews-attribution-text">
                                <div className="reviews-name" dir="auto">{active.author}</div>
                                <div className="reviews-stars-small">
                                    <span className="reviews-stars-filled">{"★".repeat(active.rating)}</span>
                                    <span className="reviews-stars-empty">{"★".repeat(5 - active.rating)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="reviews-dots">
                            {reviews.map((r, i) => (
                                <button
                                    key={r.id}
                                    className={`reviews-dot ${i === activeIndex ? "active" : ""}`}
                                    onClick={() => setActiveIndex(i)}
                                    aria-label={`Show review from ${r.author}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
