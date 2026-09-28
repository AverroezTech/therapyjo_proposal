import type { Viewport } from "next";
import { Outfit } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { LanguageProvider } from "./i18n/LanguageContext";
import Providers from "./providers";

// One family for both scripts. Inter has no Arabic glyphs, so on every LTR
// page - the staff dashboards included - Arabic text fell through to
// whatever the operating system supplied. This face draws both. (TJ-053)
//
// Self-hosted from IBM's own release (@ibm/plex-sans-arabic 1.1.0, SIL OFL,
// licence alongside) rather than next/font/google: next/font downloads with a
// Mac user agent, and Google serves Macs UNHINTED files. Windows needs the
// hinting to grid-fit small text, so the dashboards' 11-13px card text read
// as blurry on the clinic's Windows machines. IBM's files are hinted and carry
// Arabic and Latin in one file. (TJ-056)
const bodyFont = localFont({
  src: [
    { path: "./fonts/ibm-plex-sans-arabic/IBMPlexSansArabic-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-sans-arabic/IBMPlexSansArabic-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-sans-arabic/IBMPlexSansArabic-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/ibm-plex-sans-arabic/IBMPlexSansArabic-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata = {
  title: "Therapy Jo — Physiotherapy Center in Amman, Jordan | مركز العلاج الطبيعي",
  description:
    "Professional physiotherapy services including Manipulation, Cupping Therapy, Hawkgrips, Theragun, and Consultations. Located on Az-Zubayr Ben Al-Awwam St., Amman, Jordan.",
  keywords: [
    "physiotherapy",
    "Amman",
    "Jordan",
    "cupping therapy",
    "manipulation",
    "hawkgrips",
    "theragun",
    "therapy jo",
    "علاج طبيعي",
    "عمان",
  ],
  openGraph: {
    title: "Therapy Jo — Physiotherapy Center",
    description:
      "Professional physiotherapy services in Amman, Jordan. Book your consultation today.",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // The font variables go on <html>, not <body>: globals.css derives
    // --font-heading from --font-body on :root, and a variable defined only on
    // <body> is invisible there. On <body>, --font-heading never resolved and
    // every heading silently fell back to the body font. (TJ-055)
    <html
      lang="en"
      dir="ltr"
      className={`${bodyFont.variable} ${outfit.variable}`}
    >
      <body>
        <Providers>
          <LanguageProvider>{children}</LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
