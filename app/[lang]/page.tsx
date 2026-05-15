import { Compass, Map, UtensilsCrossed } from "lucide-react";
import { Hero } from "@/components/ui/Hero";
import { Card } from "@/components/ui/Card";
import { BandiereBluTeaser } from "@/components/ui/BandiereBluTeaser";
import { EnvironmentalAwarenessTeaser } from "@/components/ui/EnvironmentalAwarenessTeaser";
import { ResponsibleSunsetTeaser } from "@/components/ui/ResponsibleSunsetTeaser";
import { getHomeCopy } from "@/lib/home-copy";
import { apartments } from "@/lib/categories";
import { getCategoryForSlug } from "@/lib/guides";
import { isLocale, type Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";

const heroImage = "/images/home/hero-home.webp";

const heroCta: Record<string, { label: string; href: string }> = {
  it: { label: "Inizia l'esplorazione", href: "/it/guida" },
  en: { label: "Start exploring", href: "/en/guida" },
};

const apartmentExternalUrls: Record<string, string> = {
  isola: "https://www.vacanzemaddalena.com/it/appartamenti/isola/",
  madda: "https://www.vacanzemaddalena.com/it/appartamenti/madda/",
  lena: "https://www.vacanzemaddalena.com/it/appartamenti/lena/",
};

const guideIcons = [Compass, Map, UtensilsCrossed];

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const locale = lang as Locale;
  const copy = getHomeCopy(locale);

  return (
    <>
      <Hero
        kicker={copy.hero.kicker}
        title={copy.hero.title}
        subtitle={copy.hero.subtitle}
        imageSrc={heroImage}
        imageAlt={copy.hero.imageAlt}
        cta={heroCta[locale]}
      />

      <section
        className="mx-auto max-w-content px-6 py-20 md:px-10 md:py-28"
        aria-labelledby="insider-heading"
      >
        <div className="max-w-prose">
          <h2
            id="insider-heading"
            className="font-serif text-3xl font-semibold text-mare md:text-4xl"
          >
            {copy.insider.title}
          </h2>
          <p className="mt-4 font-sans text-base leading-relaxed text-slate/85">
            {copy.insider.intro}
          </p>
        </div>
        <ul className="mt-14 grid gap-8 md:grid-cols-3">
          {copy.guides.map((g, i) => {
            const Icon = guideIcons[i] ?? Compass;
            const category = getCategoryForSlug(g.slug) ?? "guida";
            return (
              <li key={g.slug}>
                <Card
                  href={`/${locale}/${category}/${g.slug}`}
                  title={g.title}
                  excerpt={g.excerpt}
                  cta={copy.cta.guide}
                  icon={
                    <Icon className="h-8 w-8" strokeWidth={1.25} aria-hidden />
                  }
                />
              </li>
            );
          })}
        </ul>
        <EnvironmentalAwarenessTeaser locale={locale} />
        <ResponsibleSunsetTeaser locale={locale} />
        <BandiereBluTeaser locale={locale} />
      </section>

      <section
        className="border-t border-mare/10 bg-mare/[0.03] px-6 py-20 md:px-10 md:py-28"
        aria-labelledby="stay-heading"
      >
        <div className="mx-auto max-w-content">
          <div className="max-w-prose">
            <h2
              id="stay-heading"
              className="font-serif text-3xl font-semibold text-mare md:text-4xl"
            >
              {copy.stay.title}
            </h2>
            <p className="mt-4 font-sans text-base leading-relaxed text-slate/85">
              {copy.stay.intro}
            </p>
          </div>
          <ul className="mt-14 grid gap-8 md:grid-cols-3">
            {apartments.map((apt) => (
              <li key={apt.slug}>
                <Card
                  href={apartmentExternalUrls[apt.slug] ?? `/${locale}/appartamenti/${apt.slug}`}
                  external
                  title={apt.title[locale]}
                  excerpt={apt.excerpt[locale]}
                  image={apt.image}
                  cta={copy.cta.partner}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
