"use client";

import SiteChrome from "./components/SiteChrome";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import About from "./components/About";
import Services from "./components/Services";
import Finder from "./components/Finder";
import Doctors from "./components/Doctors";
import BlogPreview from "./components/BlogPreview";
import Reviews from "./components/Reviews";
import Location from "./components/Location";
import ContactCTA from "./components/ContactCTA";
import { useLanguage } from "./i18n/LanguageContext";

export default function Home() {
  const { lang } = useLanguage();

  return (
    <div key={lang}>
      <SiteChrome>
        <Hero />
        <Marquee />
        <About />
        <Services />
        <Finder />
        <Doctors />
        <BlogPreview />
        <Reviews />
        <Location />
        <ContactCTA />
      </SiteChrome>
    </div>
  );
}
