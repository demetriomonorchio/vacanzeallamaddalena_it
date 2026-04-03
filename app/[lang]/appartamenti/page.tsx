import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarkdownArticle } from "@/components/ui/MarkdownArticle";
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

export default async function AppartamentiPage({ params }: Props) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const raw = getContent(locale);
  if (!raw) notFound();

  return (
    <div className="mx-auto max-w-content px-6 py-16 md:px-10 md:py-24">
      <MarkdownArticle source={raw} />
    </div>
  );
}
