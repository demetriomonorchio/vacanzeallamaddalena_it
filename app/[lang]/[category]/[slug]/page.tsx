import type { Metadata } from "next";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import {
  MarkdownArticle,
  parseBlocksOmitFirstH1,
  type MarkdownBlock,
} from "@/components/ui/MarkdownArticle";
import { UtilitiesDiaryArticle } from "@/components/ui/UtilitiesDiaryArticle";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  getGuideRaw,
  getGuideImagePath,
  parseFrontmatter,
  getAllGuideRefs,
  isValidGuide,
  isCategory,
  guidesByCategory,
  type Category,
} from "@/lib/guides";
import { isPolaroidDiaryCategory } from "@/lib/polaroidDiaryCategories";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { guideMetadata } from "@/lib/metadata";

type Props = {
  params: Promise<{ lang: string; category: string; slug: string }>;
};

export async function generateStaticParams() {
  const refs = getAllGuideRefs();
  return locales.flatMap((lang) =>
    refs.map(({ category, slug }) => ({ lang, category, slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, category, slug } = await params;
  if (!isLocale(lang) || !isCategory(category) || !isValidGuide(category, slug))
    return {};
  return guideMetadata(lang as Locale, category as Category, slug);
}

export default async function GuidePage({ params }: Props) {
  const { lang, category, slug } = await params;
  if (!isLocale(lang) || !isCategory(category) || !isValidGuide(category, slug))
    notFound();

  const locale = lang as Locale;
  const cat = category as Category;

  const raw = getGuideRaw(locale, cat, slug);
  if (!raw) notFound();

  const entry = guidesByCategory[cat].find((g) => g.slug === slug);
  const imageUrl = getGuideImagePath(cat, slug);
  const title = entry?.title[locale] ?? slug.replace(/-/g, " ");
  const {
    author: localAuthor,
    authorLink: localAuthorLink,
    googleMapsUrl: localGoogleMapsUrl,
    polaroidCredits: localPolaroidCredits,
  } = parseFrontmatter(raw);

  const mapsLabel =
    locale === "it" ? "Vedi posizione su Google Maps" : "View on Google Maps";
  const mapsHint =
    locale === "it"
      ? "Vuoi sapere dove si trova esattamente?"
      : "Want to know exactly where this is?";
  let fallbackAuthor: string | undefined;
  let fallbackAuthorLink: string | undefined;
  let fallbackPolaroidCredits:
    | Record<string, { author?: string; authorLink?: string }>
    | undefined;
  if (locale === "en") {
    const rawIt = getGuideRaw("it", cat, slug);
    if (rawIt) {
      const itFrontmatter = parseFrontmatter(rawIt);
      fallbackAuthor = itFrontmatter.author;
      fallbackAuthorLink = itFrontmatter.authorLink;
      fallbackPolaroidCredits = itFrontmatter.polaroidCredits;
    }
  }
  const resolvedAuthor = localAuthor ?? fallbackAuthor;
  const resolvedAuthorLink = localAuthorLink ?? fallbackAuthorLink;

  if (isPolaroidDiaryCategory(cat)) {
    const blocks = parseBlocksOmitFirstH1(raw);

    let polaroidKeyBlocks: MarkdownBlock[] | undefined;
    if (locale === "en") {
      const rawIt = getGuideRaw("it", cat, slug);
      if (rawIt) {
        polaroidKeyBlocks = parseBlocksOmitFirstH1(rawIt);
      }
    }

    return (
      <div className="mx-auto max-w-content px-6 pb-24 pt-28 md:px-10 md:pt-36">
        <div className="mx-auto max-w-3xl">
          <Breadcrumbs
            locale={locale}
            category={cat}
            slug={slug}
            slugLabel={entry?.title[locale]}
          />

          <h1 className="mt-8 text-left font-serif text-4xl font-bold text-mare md:text-5xl">
            {title}
          </h1>

          {entry?.excerpt[locale] ? (
            <p className="mt-4 text-pretty font-sans text-lg leading-relaxed text-slate/80 md:text-xl">
              {entry.excerpt[locale]}
            </p>
          ) : null}

          <div className="mt-10">
            <UtilitiesDiaryArticle
              category={cat}
              blocks={blocks}
              polaroidKeyBlocks={polaroidKeyBlocks}
              pageSlug={slug}
              locale={locale}
              defaultPhotoAuthor={resolvedAuthor}
              defaultPhotoAuthorLink={resolvedAuthorLink}
              photoCreditsByBasename={
                localPolaroidCredits ?? fallbackPolaroidCredits
              }
            />
          </div>

          {(localGoogleMapsUrl ?? undefined) && (
            <div className="mt-12 rounded-2xl bg-slate-50 p-6 shadow-sm">
              <p className="mb-4 font-sans text-sm text-slate-500">{mapsHint}</p>
              <a
                href={localGoogleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-800 px-6 py-3 font-sans text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-mare"
              >
                <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                {mapsLabel}
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content px-6 pb-24 pt-10 md:px-10 md:pt-14">
      {/* Breadcrumb — full container width */}
      <div className="mx-auto max-w-3xl">
        <Breadcrumbs
          locale={locale}
          category={cat}
          slug={slug}
          slugLabel={entry?.title[locale]}
        />
      </div>

      {/* Hero image + optional photo credit */}
      {imageUrl && (
        <div className="mt-8">
          <div className="relative h-64 w-full overflow-hidden rounded-2xl shadow-lg md:aspect-video md:h-auto">
            <Image
              src={imageUrl}
              alt={title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1152px"
              className="object-cover object-center"
            />
          </div>

          {/* Photo credit — visible only when author is defined */}
          {resolvedAuthor && (
            <p className="mt-1 flex justify-end text-[11px] italic text-slate-400">
              {resolvedAuthorLink ? (
                <a
                  href={resolvedAuthorLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-mare"
                >
                  📷 Foto di {resolvedAuthor}
                </a>
              ) : (
                <span>📷 Foto di {resolvedAuthor}</span>
              )}
            </p>
          )}
        </div>
      )}

      {/* Title + body — aligned together inside the same max-w-3xl column */}
      <div className="mx-auto max-w-3xl">
        <h1 className="mt-8 text-left font-serif text-4xl font-bold text-mare md:text-5xl">
          {title}
        </h1>

        {/* Article body — first h1 from markdown suppressed (shown above) */}
        <div className="mt-4">
          <MarkdownArticle source={raw} suppressFirstH1 />
        </div>

        {/* Google Maps CTA — shown only when googleMapsUrl is set in frontmatter */}
        {localGoogleMapsUrl && (
          <div className="mt-12 rounded-2xl bg-slate-50 p-6 shadow-sm">
            <p className="mb-4 font-sans text-sm text-slate-500">{mapsHint}</p>
            <a
              href={localGoogleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-800 px-6 py-3 font-sans text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-mare"
            >
              <MapPin className="h-4 w-4 shrink-0" aria-hidden />
              {mapsLabel}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
