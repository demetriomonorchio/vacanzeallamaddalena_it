import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiziFilter } from "@/components/ui/ServiziFilter";
import { servizi } from "@/lib/servizi";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { siteUrl, siteName } from "@/lib/metadata";

// ─── Static params ─────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

const pageMeta = {
  it: {
    title: "Servizi a La Maddalena — mappa per zona e categoria",
    description:
      "Supermercati, farmacie, bancomat, ospedale e trasporti: tutti i servizi dell'isola filtrabili per categoria e zona geografica.",
  },
  en: {
    title: "Services in La Maddalena — map by area and category",
    description:
      "Supermarkets, pharmacies, ATMs, hospital and transport: all island services filterable by category and area.",
  },
} satisfies Record<Locale, { title: string; description: string }>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const locale = lang as Locale;
  const meta = pageMeta[locale];
  const canonical = `${siteUrl}/${locale}/servizi`;

  return {
    title: `${meta.title} | ${siteName[locale]}`,
    description: meta.description,
    alternates: {
      canonical,
      languages: {
        it: `${siteUrl}/it/servizi`,
        en: `${siteUrl}/en/servizi`,
      },
    },
  };
}

// ─── Labels ───────────────────────────────────────────────────────────────────

type ServiziPageLabels = {
  heading: string;
  intro: string;
  categoriesTitle: string;
  zoneTitle: string;
  allCategories: string;
  allZone: string;
  noResults: string;
  openMaps: string;
};

const labels: Record<Locale, ServiziPageLabels> = {
  it: {
    heading: "Servizi sull'isola",
    intro:
      "Tutti i servizi pratici di La Maddalena, filtrabili per categoria e zona. Clicca su una card per aprire Google Maps.",
    categoriesTitle: "Categoria",
    zoneTitle: "Zona",
    allCategories: "Tutte",
    allZone: "Tutte le zone",
    noResults:
      "Nessun servizio trovato in questa zona, prova a cambiare filtro.",
    openMaps: "Apri in Google Maps",
  },
  en: {
    heading: "Island services",
    intro:
      "All practical services on La Maddalena, filterable by category and area. Tap a card to open Google Maps.",
    categoriesTitle: "Category",
    zoneTitle: "Area",
    allCategories: "All",
    allZone: "All areas",
    noResults: "No services found in this area — try a different filter.",
    openMaps: "Open in Google Maps",
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ lang: string }> };

export default async function ServiziPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const l = labels[locale];

  return (
    <div className="mx-auto max-w-content px-6 pb-24 pt-14 md:px-10">
      {/* Header */}
      <div className="max-w-prose">
        <h1 className="font-serif text-4xl font-bold text-mare md:text-5xl">
          {l.heading}
        </h1>
        <p className="mt-4 font-sans text-base leading-relaxed text-slate/75">
          {l.intro}
        </p>
      </div>

      {/* Filterable grid — client component */}
      <div className="mt-10">
        <ServiziFilter servizi={servizi} labels={l} />
      </div>
    </div>
  );
}
