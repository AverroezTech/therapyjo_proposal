import type { CSSProperties } from "react";
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
  variable: "--font-body-base",
  display: "swap",
});

// The same files again, limited to the Arabic blocks and drawn 10% larger.
// IBM Plex sets its Arabic small for its size (a name is ~11% narrower than
// in Noto Kufi), which on 11-13px schedule cards costs legibility. Arabic
// letters take this face; everything else, digits and punctuation included,
// falls through to the unscaled one. (TJ-057)
//
// Options deliberately mirror bodyFont's (src, preload and the default
// adjustFontFallback): next/font names emitted files by those flags, and any
// difference emits a second copy of every file under a new URL, doubling the
// download. That means this call also generates an Arial "Fallback" face
// with no unicode-range, which would catch Latin text if it sat in the stack
// ahead of bodyFont. So only this face's own family name is taken below,
// never its variable.
const arabicFont = localFont({
  src: [
    { path: "./fonts/ibm-plex-sans-arabic/IBMPlexSansArabic-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-sans-arabic/IBMPlexSansArabic-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-sans-arabic/IBMPlexSansArabic-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/ibm-plex-sans-arabic/IBMPlexSansArabic-Bold.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  declarations: [
    // Arabic, Arabic Supplement, Arabic Extended-B and -A, both Presentation
    // Forms blocks, and ZWNJ/ZWJ (joiners must shape in the same face).
    { prop: "unicode-range", value: "U+0600-06FF, U+0750-077F, U+0870-08FF, U+FB50-FDFF, U+FE70-FEFF, U+200C-200D" },
    { prop: "size-adjust", value: "110%" },
  ],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

// "'arabicFont', 'arabicFont Fallback'" -> "'arabicFont'" (see above).
const arabicFamily = arabicFont.style.fontFamily.split(",")[0].trim();

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
      style={{ "--font-body": `${arabicFamily}, var(--font-body-base)` } as CSSProperties}
    >
      <body>
        <Providers>
          <LanguageProvider>{children}</LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
