"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { categories, categoryLabels, guidesByCategory } from "@/lib/categories";
import type { Locale } from "@/lib/i18n";

const siteTitle: Record<Locale, string> = {
  it: "Vacanze alla Maddalena",
  en: "La Maddalena Holidays",
};

type Props = {
  locale: Locale;
};

const copy: Record<
  Locale,
  {
    tagline: string;
    explore: string;
    discoverMore: string;
    apartments: string;
    services: string;
    bookTitle: string;
    bookCta: string;
    bookHint: string;
    rights: string;
  }
> = {
  it: {
    tagline:
      "Guida lenta all'arcipelago — testi e ospitalità di chi vive l'isola.",
    explore: "Esplora",
    discoverMore: "Approfondimenti",
    apartments: "Appartamenti",
    services: "Servizi",
    bookTitle: "Prenotazioni",
    bookCta: "vacanzemaddalena.com",
    bookHint: "Disponibilità e prenotazioni sul sito dedicato.",
    rights: "Tutti i diritti riservati.",
  },
  en: {
    tagline:
      "A slow guide to the archipelago — written and hosted by people who live here.",
    explore: "Explore",
    discoverMore: "Deep links",
    apartments: "Apartments",
    services: "Services",
    bookTitle: "Bookings",
    bookCta: "vacanzemaddalena.com",
    bookHint: "Availability and bookings on our dedicated site.",
    rights: "All rights reserved.",
  },
};

const langSwitchLabel: Record<Locale, string> = {
  it: "English",
  en: "Italiano",
};

const seoPrioritySlugs = [
  "diving-snorkeling",
  "kayak-sport-acquatici",
  "tour-barca",
  "trekking",
  "vela",
  "food",
  "luce-fotografia",
  "quando-venire",
  "spiagge",
  "isole-minori",
  "la-maddalena",
  "spiagge-budelli-spargi",
  "come-arrivare",
  "ecologia",
  "parco-nazionale",
  "servizi",
] as const;

export function SiteFooter({ locale }: Props) {
  const pathname = usePathname() ?? "";
  const other: Locale = locale === "it" ? "en" : "it";
  const [queryString, setQueryString] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setQueryString(window.location.search);
  }, [pathname]);

  const otherPath =
    pathname.replace(/^\/(it|en)(?=\/|$)/, `/${other}`) || `/${other}`;
  const languageSwitchHref = `${otherPath}${queryString}`;
  const t = copy[locale];
  const year = new Date().getFullYear();
  const seoLinks = useMemo(() => {
    const allGuides = Object.entries(guidesByCategory).flatMap(([category, entries]) =>
      entries.map((entry) => ({
        href: `/${locale}/${category}/${entry.slug}`,
        label: entry.title[locale],
        slug: entry.slug,
      }))
    );
    return seoPrioritySlugs
      .map((slug) => allGuides.find((guide) => guide.slug === slug))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .slice(0, 10);
  }, [locale]);

  return (
    <footer className="border-t border-mare/10 bg-sabbia">
      <div className="mx-auto max-w-content px-6 py-12 md:px-10 md:py-14">
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {/* Brand */}
          <div className="text-left">
            <p className="font-serif text-lg font-semibold text-mare">
              {siteTitle[locale]}
            </p>
            <p className="mt-3 max-w-xs font-sans text-sm leading-relaxed text-slate/70">
              {t.tagline}
            </p>
          </div>

          {/* Nav */}
          <div>
            <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-slate/45">
              {t.explore}
            </p>
            <ul className="mt-4 flex flex-col gap-2.5 font-sans text-sm text-slate/80">
              <li>
                <Link
                  href={`/${locale}/appartamenti`}
                  className="transition-colors hover:text-mare"
                >
                  {t.apartments}
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/${locale}/${cat}`}
                    className="transition-colors hover:text-mare"
                  >
                    {categoryLabels[cat][locale]}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={`/${locale}/servizi`}
                  className="transition-colors hover:text-mare"
                >
                  {t.services}
                </Link>
              </li>
            </ul>
            <p className="mt-6 font-sans text-[11px] font-bold uppercase tracking-widest text-slate/45">
              {t.discoverMore}
            </p>
            <ul className="mt-3 grid grid-cols-1 gap-2 font-sans text-xs text-slate/75">
              {seoLinks.map((item) => (
                <li key={`seo-${item.href}`}>
                  <Link href={item.href} className="transition-colors hover:text-mare">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Booking */}
          <div>
            <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-slate/45">
              {t.bookTitle}
            </p>
            <p className="mt-4 font-sans text-sm leading-relaxed text-slate/70">
              {t.bookHint}
            </p>
            <a
              href="https://vacanzemaddalena.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block font-sans text-sm font-semibold text-mare underline-offset-4 transition-colors hover:underline"
            >
              {t.bookCta} ↗
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-mare/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-left font-sans text-xs text-slate/55">
            © {year} {siteTitle[locale]}. {t.rights}
          </p>
          <a
            href={languageSwitchHref}
            hrefLang={other}
            className="font-sans text-xs font-semibold text-slate/50 underline-offset-4 transition-colors hover:text-mare hover:underline"
          >
            {langSwitchLabel[locale]}
          </a>
        </div>
      </div>
    </footer>
  );
}
