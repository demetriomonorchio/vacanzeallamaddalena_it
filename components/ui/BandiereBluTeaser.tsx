import Link from "next/link";
import { UtilitiesPolaroidInner } from "@/components/ui/UtilitiesPolaroidInner";
import type { Locale } from "@/lib/i18n";
import { polaroidRotationDeg } from "@/lib/utilitiesImageSlug";

type BandiereBluTeaserProps = {
  locale: Locale;
};

const copy: Record<Locale, { title: string; body: string; cta: string }> = {
  it: {
    title: "Bandiere Blu 2026 in Sardegna",
    body: "Diciassette località premiate dalla FEE, con Teulada nuova entrata: l'elenco per area e cosa significa per chi ama il mare.",
    cta: "Leggi l'articolo sulle Bandiere Blu",
  },
  en: {
    title: "Blue Flag 2026 in Sardinia",
    body: "Seventeen locations recognised by FEE, with Teulada newly listed: the regional roll call and what it means for sea lovers.",
    cta: "Read the Blue Flag article",
  },
};

export function BandiereBluTeaser({ locale }: BandiereBluTeaserProps) {
  const t = copy[locale];
  return (
    <section
      className="mt-10 rounded-2xl border border-mare/15 bg-sabbia/70 p-6 md:p-8"
      aria-labelledby="bandiere-blu-teaser"
    >
      <div className="grid items-start gap-8 md:grid-cols-[1fr_220px]">
        <div>
          <h3
            id="bandiere-blu-teaser"
            className="font-serif text-3xl font-semibold text-mare md:text-4xl"
          >
            {t.title}
          </h3>
          <p className="mb-8 mt-4 max-w-2xl font-sans text-base leading-relaxed text-slate/85">
            {t.body}
          </p>
          <Link
            href={`/${locale}/bandiere-blu-2026-sardegna`}
            className="inline-flex items-center rounded-full bg-mare px-4 py-2 font-sans text-xs font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
          >
            {t.cta}
          </Link>
        </div>
        <div className="w-[11rem] justify-self-center md:w-[13rem]">
          <UtilitiesPolaroidInner
            src="/images/utilities/ecologia/bandiere-blu-2026-sardegna.webp"
            expectedBasename="bandiere-blu-2026-sardegna"
            category="utilities"
            pageSlug="ecologia"
            rotationDeg={polaroidRotationDeg("home:bandiere-blu-2026-sardegna")}
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
