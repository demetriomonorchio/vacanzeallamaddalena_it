import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  parseBlocksOmitFirstH1,
  type MarkdownBlock,
} from "@/components/ui/MarkdownArticle";
import { UtilitiesDiaryArticle } from "@/components/ui/UtilitiesDiaryArticle";
import {
  getGuideRaw,
  guidesByCategory,
  isValidGuide,
  type Category,
} from "@/lib/guides";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { guideMetadata } from "@/lib/metadata";

const CATEGORY = "utilities" as const satisfies Category;

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateStaticParams() {
  const slugs = guidesByCategory[CATEGORY].map((g) => g.slug);
  return locales.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !isValidGuide(CATEGORY, slug)) return {};
  return guideMetadata(lang as Locale, CATEGORY, slug);
}

export default async function UtilitiesDiaryPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !isValidGuide(CATEGORY, slug)) notFound();

  const locale = lang as Locale;
  const raw = getGuideRaw(locale, CATEGORY, slug);
  if (!raw) notFound();

  const entry = guidesByCategory[CATEGORY].find((g) => g.slug === slug);
  const title = entry?.title[locale] ?? slug.replace(/-/g, " ");

  const blocks = parseBlocksOmitFirstH1(raw);

  /** Stessi file PNG per tutte le lingue: chiavi Polaroid dal markdown IT. */
  let polaroidKeyBlocks: MarkdownBlock[] | undefined;
  if (locale === "en") {
    const rawIt = getGuideRaw("it", CATEGORY, slug);
    if (rawIt) polaroidKeyBlocks = parseBlocksOmitFirstH1(rawIt);
  }

  return (
    <div className="mx-auto max-w-content px-6 pb-24 pt-28 md:px-10 md:pt-36">
      <div className="mx-auto max-w-3xl">
        <Breadcrumbs
          locale={locale}
          category={CATEGORY}
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
            category={CATEGORY}
            blocks={blocks}
            polaroidKeyBlocks={polaroidKeyBlocks}
            pageSlug={slug}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}
