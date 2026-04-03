"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { categories, categoryLabels } from "@/lib/categories";
import type { Locale } from "@/lib/i18n";

type NavbarProps = {
  locale: Locale;
};

const langSwitchLabel: Record<Locale, string> = {
  it: "English",
  en: "Italiano",
};

const appartamentiLabel: Record<Locale, string> = {
  it: "Appartamenti",
  en: "Apartments",
};

export function Navbar({ locale }: NavbarProps) {
  const other: Locale = locale === "it" ? "en" : "it";
  const pathname = usePathname();

  // Home page = exactly "/it" or "/en"
  const isHome = pathname === `/${locale}` || pathname === "/";

  // On home: transparent until scrolled; on all other pages: always solid
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // isSolid drives every style decision:
  // – subpages → always true
  // – home     → true only after scrolling 10px
  const isSolid = !isHome || scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isSolid
          ? "border-b border-mare/10 bg-sabbia shadow-sm"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      {/* Primary row — logo + CTA + lang switch */}
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-3 md:px-10 md:py-4">
        <Link href={`/${locale}`} className="mr-6 flex items-center md:mr-8">
          <Image
            src="/images/home/logo.webp"
            alt="Vacanze alla Maddalena - Logo"
            width={200}
            height={70}
            className="h-[45px] w-auto object-contain md:h-[65px]"
            priority
          />
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/appartamenti`}
            className={`rounded px-4 py-1.5 font-sans text-xs font-bold tracking-wide transition-all duration-300 ${
              isSolid
                ? "bg-mare text-sabbia hover:opacity-80"
                : "bg-sabbia/90 text-mare hover:bg-sabbia"
            }`}
          >
            {appartamentiLabel[locale]}
          </Link>

          <Link
            href={`/${other}`}
            hrefLang={other}
            className={`font-sans text-xs font-semibold underline-offset-4 transition-colors duration-300 hover:underline ${
              isSolid
                ? "text-slate/50 hover:text-mare"
                : "text-white drop-shadow-md hover:text-sabbia"
            }`}
          >
            {langSwitchLabel[locale]}
          </Link>
        </div>
      </div>

      {/* Secondary row — category navigation */}
      <nav
        aria-label={locale === "it" ? "Categorie" : "Categories"}
        className={`border-t transition-colors duration-300 ${
          isSolid ? "border-mare/10" : "border-white/10"
        }`}
      >
        <ul className="mx-auto flex max-w-content gap-0 overflow-x-auto px-4 md:px-8">
          {categories.map((cat) => (
            <li key={cat}>
              <Link
                href={`/${locale}/${cat}`}
                className={`inline-block whitespace-nowrap px-3 py-2.5 font-sans text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${
                  isSolid
                    ? "text-mare/70 hover:text-mare"
                    : "text-white drop-shadow-md hover:text-sabbia"
                }`}
              >
                {categoryLabels[cat][locale]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
