import Link from "next/link";
import { UtilitiesPolaroidInner } from "@/components/ui/UtilitiesPolaroidInner";
import type { Locale } from "@/lib/i18n";
import { polaroidRotationDeg } from "@/lib/utilitiesImageSlug";

type ResponsibleSunsetTeaserProps = {
  locale: Locale;
};

const copy: Record<Locale, { title: string; body: string; cta: string }> = {
  it: {
    title: "Il tramonto perfetto, senza bottiglie",
    body: "Una guida pratica per goderti il tramonto a La Maddalena in modo responsabile, senza lasciare vetro sulle scogliere.",
    cta: "Leggi la guida al tramonto responsabile",
  },
  en: {
    title: "The perfect sunset, no bottles left behind",
    body: "A practical guide to enjoy La Maddalena sunsets responsibly, without leaving glass on the cliffs.",
    cta: "Read the responsible sunset guide",
  },
};

export function ResponsibleSunsetTeaser({ locale }: ResponsibleSunsetTeaserProps) {
  const t = copy[locale];
  return (
    <section className="mt-10 rounded-2xl border border-mare/15 bg-sabbia/70 p-6 md:p-8" aria-labelledby="sunset-teaser">
      <div className="grid items-start gap-8 md:grid-cols-[1fr_220px]">
        <div>
          <h3 id="sunset-teaser" className="font-serif text-3xl font-semibold text-mare md:text-4xl">
            {t.title}
          </h3>
          <p className="mb-8 mt-4 max-w-2xl font-sans text-base leading-relaxed text-slate/85">
            {t.body}
          </p>
          <Link
            href={`/${locale}/tramonto-responsabile`}
            className="inline-flex items-center rounded-full bg-mare px-4 py-2 font-sans text-xs font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
          >
            {t.cta}
          </Link>
        </div>
        <div className="w-[11rem] justify-self-center md:w-[13rem]">
          <UtilitiesPolaroidInner
            src="/images/utilities/ecologia/il-decalogo-tur.png"
            expectedBasename="il-decalogo-del"
            category="utilities"
            pageSlug="ecologia"
            rotationDeg={polaroidRotationDeg("home:tramonto-responsabile")}
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
