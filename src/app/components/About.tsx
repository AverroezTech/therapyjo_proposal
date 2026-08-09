"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "../i18n/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
    const { t, lang } = useLanguage();
    const statsRef = useRef<HTMLDivElement>(null);

    // Counter animation — re-runs on language change, disabled on mobile/tablet
    useEffect(() => {
        if (!statsRef.current) return;

        // On mobile/tablet, just show the final values — no animation
        const isMobile = window.matchMedia("(max-width: 1024px)").matches || "ontouchstart" in window;
        if (isMobile) return;

        const els = statsRef.current.querySelectorAll<HTMLElement>(".about-stat-number");
        const animations: gsap.core.Tween[] = [];

        els.forEach((el) => {
            const text = el.getAttribute("data-value") || el.textContent || "";
            const match = text.match(/(\d+)/);
            if (match) {
                const endValue = parseInt(match[0]);
                const suffix = text.replace(match[0], "");
                el.textContent = "0" + suffix;

                const obj = { val: 0 };
                const tween = gsap.to(obj, {
                    val: endValue,
                    duration: 2,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 90%",
                        toggleActions: "play none none none",
                    },
                    onUpdate: () => {
                        el.textContent = Math.round(obj.val) + suffix;
                    },
                });
                animations.push(tween);
            }
        });

        return () => {
            animations.forEach((t) => t.kill());
            ScrollTrigger.getAll()
                .filter((st) => {
                    const trigger = st.vars.trigger;
                    return trigger instanceof HTMLElement && trigger.classList.contains("about-stat-number");
                })
                .forEach((st) => st.kill());
        };
    }, [lang]);

    return (
        <section id="about" className="about section-padding">
            <div className="container">
                <div className="about-grid">
                    <div className="gsap-reveal-left">
                        <div className="about-image-wrapper">
                            <Image
                                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80"
                                alt="Professional physiotherapy session"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                style={{ objectFit: "cover" }}
                                loading="lazy"
                            />
                            <div className="about-image-accent"></div>
                        </div>
                    </div>

                    <div className="gsap-reveal-right">
                        <div className="section-label">{t.about.label}</div>
                        <h2 className="section-title">{t.about.title}</h2>
                        <p className="section-subtitle">{t.about.description1}</p>
                        <p className="section-subtitle" style={{ marginTop: "1rem" }}>
                            {t.about.description2}
                        </p>

                        <div className="about-stats" ref={statsRef}>
                            <div className="about-stat">
                                <div className="about-stat-number" data-value={t.about.stat1Number}>
                                    {t.about.stat1Number}
                                </div>
                                <div className="about-stat-label">{t.about.stat1Label}</div>
                            </div>
                            <div className="about-stat">
                                <div className="about-stat-number" data-value={t.about.stat2Number}>
                                    {t.about.stat2Number}
                                </div>
                                <div className="about-stat-label">{t.about.stat2Label}</div>
                            </div>
                            <div className="about-stat">
                                <div className="about-stat-number" data-value={t.about.stat3Number}>
                                    {t.about.stat3Number}
                                </div>
                                <div className="about-stat-label">{t.about.stat3Label}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
