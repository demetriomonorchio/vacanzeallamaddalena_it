import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  isCategory,
  getGuidesWithImages,
  categoryMeta,
  categories,
  type Category,
} from "@/lib/guides";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { siteUrl } from "@/lib/metadata";

type Props = { params: Promise<{ lang: string; category: string }> };

export async function generateStaticParams() {
  return locales.flatMap((lang) =>
    categories.map((category) => ({ lang, category }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, category } = await params;
  if (!isLocale(lang) || !isCategory(category)) return {};
  const locale = lang as Locale;
  const cat = category as Category;
  const meta = categoryMeta[cat][locale];
  const canonical = `${siteUrl}/${locale}/${cat}`;

  return {
    title: meta.title,
    description: meta.intro,
    alternates: {
      canonical,
      languages: {
        it: `${siteUrl}/it/${cat}`,
        en: `${siteUrl}/en/${cat}`,
        "x-default": `${siteUrl}/it/${cat}`,
      },
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { lang, category } = await params;
  if (!isLocale(lang) || !isCategory(category)) notFound();

  const locale = lang as Locale;
  const cat = category as Category;
  const meta = categoryMeta[cat][locale];
  const guides = getGuidesWithImages(cat);
  const ctaLabel = locale === "it" ? "Apri la guida" : "Open the guide";

  return (
    <div className="mx-auto max-w-content px-6 py-16 md:px-10 md:py-24">
      <Breadcrumbs locale={locale} category={cat} />

      <div className="mt-8 max-w-prose">
        <h1 className="font-serif text-4xl font-semibold text-mare md:text-5xl">
          {meta.title}
        </h1>
        <p className="mt-5 font-sans text-base leading-relaxed text-slate/85">
          {meta.intro}
        </p>
      </div>

      {guides.length > 0 ? (
        <ul className="mt-14 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {guides.map((guide) => (
            <li key={guide.slug}>
              <Card
                href={`/${locale}/${cat}/${guide.slug}`}
                title={guide.title[locale]}
                excerpt={guide.excerpt[locale]}
                cta={ctaLabel}
                image={guide.image}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-14 font-sans text-sm text-slate/50">
          {locale === "it"
            ? "Contenuti in arrivo."
            : "Content coming soon."}
        </p>
      )}
    </div>
  );
}
