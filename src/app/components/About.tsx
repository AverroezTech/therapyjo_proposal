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

    useEffect(() => {
        if (!statsRef.current) return;

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
                    duration: 1.4,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: statsRef.current,
                        start: "top 85%",
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
            animations.forEach((tw) => tw.kill());
        };
    }, [lang]);

    return (
        <section id="about" className="about section-padding">
            <div className="container about-grid">
                <div className="about-image-frame">
                    <div className="about-image-outline"></div>
                    <div className="about-image-wrapper">
                        <Image
                            src="/cupping.webp"
                            alt="Treatment session at Therapy Jo"
                            fill
                            sizes="(max-width: 1000px) 100vw, 50vw"
                            style={{ objectFit: "cover" }}
                        />
                    </div>
                </div>

                <div className="reveal">
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
        </section>
    );
}
