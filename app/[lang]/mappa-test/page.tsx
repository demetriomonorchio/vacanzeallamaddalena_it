import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MaddalenaMap } from "@/components/ui/MaddalenaMap";
import { isLocale, type Locale } from "@/lib/i18n";

type Props = {
  params: Promise<{ lang: string }>;
};

const copy: Record<Locale, { title: string; intro: string }> = {
  it: {
    title: "Mappa test La Maddalena",
    intro:
      "Pagina di test per verificare marker alloggi e ristoranti su base Mapbox.",
  },
  en: {
    title: "La Maddalena test map",
    intro: "Testing page to verify accommodation and restaurant markers on Mapbox.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  return {
    title: copy[lang].title,
    description: copy[lang].intro,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function MappaTestPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const locale = lang as Locale;
  const c = copy[locale];

  return (
    <div className="mx-auto max-w-content px-6 pb-24 pt-28 md:px-10 md:pt-36">
      <div className="max-w-2xl">
        <h1 className="font-serif text-4xl font-bold text-mare md:text-5xl">
          {c.title}
        </h1>
        <p className="mt-4 font-sans text-base leading-relaxed text-slate/80">
          {c.intro}
        </p>
      </div>

      <MaddalenaMap className="mt-10" />
    </div>
  );
}
