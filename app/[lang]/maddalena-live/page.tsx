import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MaddalenaMap } from "@/components/ui/MaddalenaMap";
import { isLocale, type Locale } from "@/lib/i18n";

type Props = {
  params: Promise<{ lang: string }>;
};

const copy: Record<Locale, { title: string; intro: string }> = {
  it: {
    title: "Maddalena Live",
    intro: "Il Tuo Local Advisor",
  },
  en: {
    title: "Maddalena Live",
    intro: "Your Local Advisor",
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

export default async function MaddalenaLivePage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const locale = lang as Locale;
  const c = copy[locale];

  return (
    <div className="mx-auto max-w-content px-6 pb-24 pt-28 md:px-10 md:pt-36">
      <div className="max-w-2xl">
        <h1
          className="text-4xl font-semibold tracking-tight text-mare md:text-5xl"
          style={{
            fontFamily:
              "Inter, Montserrat, ui-sans-serif, system-ui, -apple-system, sans-serif",
          }}
        >
          {c.title}
        </h1>
        <p
          className="mt-3 text-sm font-medium uppercase tracking-[0.08em] text-slate/65 md:text-base"
          style={{
            fontFamily:
              "Inter, Montserrat, ui-sans-serif, system-ui, -apple-system, sans-serif",
          }}
        >
          {c.intro}
        </p>
      </div>

      <MaddalenaMap className="mt-10" locale={locale} />
    </div>
  );
}
