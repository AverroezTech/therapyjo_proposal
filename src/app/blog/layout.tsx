"use client";

import SiteChrome from "../components/SiteChrome";
import { useLanguage } from "../i18n/LanguageContext";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    const { lang } = useLanguage();
    return (
        <div key={lang} style={{ background: "var(--bg-page)" }}>
            <SiteChrome>{children}</SiteChrome>
        </div>
    );
}
