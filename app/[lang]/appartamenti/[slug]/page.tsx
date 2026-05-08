import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { MarkdownArticle } from "@/components/ui/MarkdownArticle";
import { apartments, getApartment } from "@/lib/categories";
import { isLocale, locales, defaultLocale, type Locale } from "@/lib/i18n";
import { siteUrl, siteName } from "@/lib/metadata";

// ─── Static params ─────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return locales.flatMap((lang) =>
    apartments.map(({ slug }) => ({ lang, slug }))
  );
}

// ─── Optional markdown reader ─────────────────────────────────────────────────

function getApartmentContent(locale: Locale, slug: string): string | null {
  const file = path.join(
    process.cwd(),
    "content",
    locale,
    "appartamenti",
    `${slug}.md`
  );
  if (fs.existsSync(file)) return fs.readFileSync(file, "utf8");

  const fallback = path.join(
    process.cwd(),
    "content",
    defaultLocale,
    "appartamenti",
    `${slug}.md`
  );
  if (fs.existsSync(fallback)) return fs.readFileSync(fallback, "utf8");
  return null;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const apt = getApartment(slug);
  if (!apt) return {};

  const title = apt.title[locale];
  const description = apt.excerpt[locale];
  const canonical = `${siteUrl}/${locale}/appartamenti/${slug}`;

  return {
    title: `${title} | ${siteName[locale]}`,
    description,
    alternates: {
      canonical,
      languages: {
        it: `${siteUrl}/it/appartamenti/${slug}`,
        en: `${siteUrl}/en/appartamenti/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteName[locale],
      images: [{ url: apt.image }],
      locale: locale === "it" ? "it_IT" : "en_GB",
      type: "website",
    },
  };
}

// ─── Gallery labels ────────────────────────────────────────────────────────────

const galleryLabel: Record<Locale, string> = {
  it: "Galleria Fotografica",
  en: "Photo Gallery",
};

const backLabel: Record<Locale, string> = {
  it: "Appartamenti",
  en: "Apartments",
};

const bookingCtaLabel: Record<Locale, string> = {
  it: "Verifica disponibilita su vacanzemaddalena.com",
  en: "Check availability on vacanzemaddalena.com",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

type Props = { params: Promise<{ lang: string; slug: string }> };

export default async function ApartmentDetailPage({ params }: Props) {
  const { lang, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;

  const apt = getApartment(slug);
  if (!apt) notFound();

  const raw = getApartmentContent(locale, slug);

  return (
    <div className="mx-auto max-w-content px-6 pb-24 pt-10 md:px-10 md:pt-14">

      {/* Breadcrumb */}
      <nav
        aria-label={locale === "it" ? "Percorso di navigazione" : "Breadcrumb"}
        className="flex flex-wrap items-center gap-1.5 font-sans text-xs text-slate/55"
      >
        <Link href={`/${locale}`} className="transition-colors hover:text-mare">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
        <Link
          href={`/${locale}/appartamenti`}
          className="transition-colors hover:text-mare"
        >
          {backLabel[locale]}
        </Link>
        <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
        <span className="text-slate">{apt.title[locale]}</span>
      </nav>

      {/* Hero image */}
      <div className="relative mt-8 h-64 w-full overflow-hidden rounded-2xl shadow-lg md:aspect-video md:h-auto">
        <Image
          src={apt.image}
          alt={apt.title[locale]}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1152px"
          className="object-cover object-center"
        />
      </div>

      {/* Title + body */}
      <div className="mx-auto max-w-3xl">
        <h1 className="mt-8 font-serif text-4xl font-bold text-mare md:text-5xl">
          {apt.title[locale]}
        </h1>
        <div className="mt-4">
          <a
            href={apt.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full bg-mare px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
          >
            {bookingCtaLabel[locale]}
          </a>
        </div>

        {raw ? (
          <div className="mt-4">
            <MarkdownArticle source={raw} suppressFirstH1 />
          </div>
        ) : (
          <p className="mt-4 font-sans text-base leading-relaxed text-slate-800">
            {apt.excerpt[locale]}
          </p>
        )}
      </div>

      {/* Photo gallery */}
      <section className="mx-auto mt-16 max-w-content" aria-labelledby="gallery-heading">
        <h2
          id="gallery-heading"
          className="mb-6 font-serif text-2xl font-semibold text-mare"
        >
          {galleryLabel[locale]}
        </h2>

        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {apt.gallery.map((src, i) => (
            <li key={i} className="overflow-hidden rounded-xl shadow-sm">
              <div className="relative aspect-square w-full">
                <Image
                  src={src}
                  alt={`${apt.title[locale]} — foto ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

    </div>
  );
}
