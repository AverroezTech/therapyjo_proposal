import type { Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Outfit } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./i18n/LanguageContext";
import Providers from "./providers";

// One family for both scripts. Inter has no Arabic glyphs, so on every LTR
// page - the staff dashboards included - Arabic text fell through to
// whatever the operating system supplied. This face draws both. (TJ-053)
const bodyFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
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
