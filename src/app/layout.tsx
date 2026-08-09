import { Inter, Outfit, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./i18n/LanguageContext";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const notoKufi = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body
        className={`${inter.variable} ${outfit.variable} ${notoKufi.variable}`}
      >
        <Providers>
          <LanguageProvider>{children}</LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
