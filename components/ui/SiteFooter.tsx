"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { categories, categoryLabels } from "@/lib/categories";
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

export function SiteFooter({ locale }: Props) {
  const pathname = usePathname() ?? "";
  const other: Locale = locale === "it" ? "en" : "it";
  const otherPath =
    pathname.replace(/^\/(it|en)(?=\/|$)/, `/${other}`) || `/${other}`;
  const t = copy[locale];
  const year = new Date().getFullYear();

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
          <Link
            href={otherPath}
            hrefLang={other}
            className="font-sans text-xs font-semibold text-slate/50 underline-offset-4 transition-colors hover:text-mare hover:underline"
          >
            {langSwitchLabel[locale]}
          </Link>
        </div>
      </div>
    </footer>
  );
}
