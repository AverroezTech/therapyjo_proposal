"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function GSAPAnimations() {
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero entrance (background fade-up is handled by the heroFadeUp CSS keyframe)
            const heroTl = gsap.timeline({ delay: 0.3 });
            heroTl
                .from(".hero-badge", { y: 20, opacity: 0, duration: 0.6, ease: "power3.out" })
                .from(".hero-title", { y: 40, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.3")
                .from(".hero-subtitle", { y: 30, opacity: 0, duration: 0.6, ease: "power3.out" }, "-=0.4")
                .from(".hero-actions", { y: 20, opacity: 0, duration: 0.6, ease: "power3.out" }, "-=0.3");

            // General reveals
            gsap.utils.toArray<HTMLElement>(".gsap-reveal, .reveal").forEach((el) => {
                gsap.fromTo(el, { y: 40, opacity: 0 }, {
                    y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
                    scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
                });
            });

            gsap.utils.toArray<HTMLElement>(".gsap-reveal-left").forEach((el) => {
                gsap.fromTo(el, { x: -50, opacity: 0 }, {
                    x: 0, opacity: 1, duration: 0.8, ease: "power3.out",
                    scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
                });
            });

            gsap.utils.toArray<HTMLElement>(".gsap-reveal-right").forEach((el) => {
                gsap.fromTo(el, { x: 50, opacity: 0 }, {
                    x: 0, opacity: 1, duration: 0.8, ease: "power3.out",
                    scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
                });
            });

            // Services rows staggered reveal
            const svcRows = gsap.utils.toArray<HTMLElement>(".svc-row");
            if (svcRows.length) {
                svcRows.forEach((row, i) => {
                    gsap.fromTo(row, { y: 20, opacity: 0 }, {
                        y: 0, opacity: 1, duration: 0.5, ease: "power3.out",
                        delay: i * 0.04,
                        scrollTrigger: { trigger: row, start: "top 92%", toggleActions: "play none none none" },
                    });
                });
            }

            // About stats are animated within About.tsx to handle language changes

            // Hero parallax
            gsap.to(".hero-content", {
                y: -50, opacity: 0.3, ease: "none",
                scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
            });

            // Contact reveal
            gsap.fromTo(".contact-buttons", { y: 30, opacity: 0 }, {
                y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
                scrollTrigger: { trigger: ".contact-cta", start: "top 75%", toggleActions: "play none none none" },
            });
        });

        return () => ctx.revert();
    }, []);

    return null;
}
