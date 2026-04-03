import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownArticle } from "@/components/ui/MarkdownArticle";
import { apartments } from "@/lib/categories";
import { locales, isLocale, defaultLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { siteUrl, siteName } from "@/lib/metadata";

// ─── Static params ─────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// ─── Content reader ────────────────────────────────────────────────────────────

function getContent(locale: Locale): string | null {
  const file = path.join(
    process.cwd(),
    "content",
    locale,
    "appartamenti.md"
  );
  if (fs.existsSync(file)) return fs.readFileSync(file, "utf8");

  // Fallback to default locale when translation is not yet available
  const fallback = path.join(
    process.cwd(),
    "content",
    defaultLocale,
    "appartamenti.md"
  );
  if (fs.existsSync(fallback)) return fs.readFileSync(fallback, "utf8");
  return null;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

const pageMeta: Record<Locale, { title: string; description: string }> = {
  it: {
    title: "Appartamenti a La Maddalena — Isola, Madda e Lena | Vacanze alla Maddalena",
    description:
      "Tre dimore nel cuore dell'arcipelago gestite da Giusy e Demetrio. Non posti letto: tre modi diversi di vivere La Maddalena come se ci abitassi davvero.",
  },
  en: {
    title: "Apartments in La Maddalena — Isola, Madda and Lena | La Maddalena Holidays",
    description:
      "Three homes at the heart of the archipelago, managed by Giusy and Demetrio. Not just beds — three different ways to live La Maddalena as if you actually lived there.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const meta = pageMeta[locale];
  const canonical = `${siteUrl}/${locale}/appartamenti`;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical,
      languages: {
        it: `${siteUrl}/it/appartamenti`,
        en: `${siteUrl}/en/appartamenti`,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonical,
      siteName: siteName[locale],
      locale: locale === "it" ? "it_IT" : "en_GB",
      type: "website",
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ lang: string }> };

const ctaLabel: Record<Locale, string> = {
  it: "Scopri l'appartamento",
  en: "Discover the apartment",
};

export default async function AppartamentiPage({ params }: Props) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const raw = getContent(locale);
  if (!raw) notFound();

  return (
    <div className="mx-auto max-w-content px-6 py-16 md:px-10 md:py-24">
      {/* Intro text from markdown */}
      <div className="max-w-prose">
        <MarkdownArticle source={raw} />
      </div>

      {/* Apartment cards with hero images */}
      <ul className="mt-14 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
        {apartments.map((apt) => (
          <li key={apt.slug}>
            <Link
              href={`/${locale}/appartamenti/${apt.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-mare/15 bg-sabbia shadow-sm transition-shadow duration-300 hover:shadow-md"
            >
              {/* Hero image */}
              <div className="relative h-52 w-full shrink-0 overflow-hidden">
                <Image
                  src={apt.image}
                  alt={apt.title[locale]}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Text */}
              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-serif text-xl font-semibold text-mare">
                  {apt.title[locale]}
                </h2>
                <p className="mt-2 flex-1 font-sans text-sm leading-relaxed text-slate/80">
                  {apt.excerpt[locale]}
                </p>
                <span className="mt-5 font-sans text-xs font-bold uppercase tracking-wider text-mare underline-offset-4 group-hover:underline">
                  {ctaLabel[locale]}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
