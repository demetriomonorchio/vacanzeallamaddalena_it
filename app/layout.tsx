import type { Metadata } from "next";
import { Caveat, Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { siteUrl } from "@/lib/metadata";
import { defaultLocale } from "@/lib/i18n";

const fontSerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const fontSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const fontHandwriting = Caveat({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-handwriting",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={defaultLocale}
      className={`${fontSerif.variable} ${fontSans.variable} ${fontHandwriting.variable}`}
    >
      <body className="font-sans">
        {children}
        {/* Portal per lightbox polaroid (sopra tutto il layout, stacking affidabile) */}
        <div id="lightbox-root" />
      </body>
    </html>
  );
}
