"use client";

import { useEffect, useState, ReactNode } from "react";
import AccentHairline from "./AccentHairline";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppFloat from "./WhatsAppFloat";
import BookingBar from "./BookingBar";
import GSAPAnimations from "./GSAPAnimations";

export default function SiteChrome({ children }: { children: ReactNode }) {
    const [showBookBar, setShowBookBar] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowBookBar(window.scrollY > window.innerHeight * 0.85);
        };
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <GSAPAnimations />
            <AccentHairline />
            <Navbar />
            <main>{children}</main>
            <Footer />
            <WhatsAppFloat barVisible={showBookBar} />
            <BookingBar visible={showBookBar} />
        </>
    );
}
