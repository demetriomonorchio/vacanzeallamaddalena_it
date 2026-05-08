import Link from "next/link";
import { UtilitiesPolaroidInner } from "@/components/ui/UtilitiesPolaroidInner";
import type { Locale } from "@/lib/i18n";
import { polaroidRotationDeg } from "@/lib/utilitiesImageSlug";

type EnvironmentalAwarenessTeaserProps = {
  locale: Locale;
};

const copy: Record<Locale, { title: string; body: string; cta: string }> = {
  it: {
    title: "Il Paradiso non merita un filtro",
    body: "Una guida pratica per proteggere spiagge e mare dai mozziconi, con numeri reali e azioni semplici da applicare subito.",
    cta: "Leggi la guida al rispetto",
  },
  en: {
    title: "Paradise deserves no filter",
    body: "A practical guide to protect beaches and sea from cigarette butts, with real numbers and simple actions you can apply immediately.",
    cta: "Read the respect guide",
  },
};

export function EnvironmentalAwarenessTeaser({ locale }: EnvironmentalAwarenessTeaserProps) {
  const t = copy[locale];
  return (
    <section className="mt-14 rounded-2xl border border-mare/15 bg-sabbia/70 p-6 md:p-8" aria-labelledby="env-teaser">
      <div className="grid items-start gap-8 md:grid-cols-[1fr_220px]">
        <div>
          <h3 id="env-teaser" className="font-serif text-3xl font-semibold text-mare md:text-4xl">
            {t.title}
          </h3>
          <p className="mb-8 mt-4 max-w-2xl font-sans text-base leading-relaxed text-slate/85">
            {t.body}
          </p>
          <Link
            href={`/${locale}/rispetto-ambiente`}
            className="inline-flex items-center rounded-full bg-mare px-4 py-2 font-sans text-xs font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
          >
            {t.cta}
          </Link>
        </div>
        <div className="w-[11rem] justify-self-center md:w-[13rem]">
          <UtilitiesPolaroidInner
            src="/images/utilities/ecologia/il-decalogo-del.png"
            expectedBasename="la-bellezza-non-merita-un-filtro"
            category="utilities"
            pageSlug="ecologia"
            rotationDeg={polaroidRotationDeg("home:rispetto-ambiente")}
            missingLabel={locale === "it" ? "Immagine assente" : "Image missing"}
            photoCreditLabel={locale === "it" ? "Foto di" : "Photo by"}
            photoCreditAuthor=""
            photoCreditLink="https://www.vacanzemaddalena.com/"
          />
        </div>
      </div>
    </section>
  );
}
