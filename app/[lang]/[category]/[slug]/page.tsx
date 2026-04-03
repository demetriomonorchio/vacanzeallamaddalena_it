import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MarkdownArticle } from "@/components/ui/MarkdownArticle";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  getGuideRaw,
  getGuideImagePath,
  getAllGuideRefs,
  isValidGuide,
  isCategory,
  guidesByCategory,
  type Category,
} from "@/lib/guides";
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

      {/* Hero image — full container width, h-64 mobile / aspect-video desktop */}
      {imageUrl && (
        <div className="relative mt-8 h-64 w-full overflow-hidden rounded-2xl shadow-lg md:aspect-video md:h-auto">
          <Image
            src={imageUrl}
            alt={title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1152px"
            className="object-cover object-center"
          />
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
      </div>
    </div>
  );
}
