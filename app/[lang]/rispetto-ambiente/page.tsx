import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  parseBlocks,
  parseBlocksOmitFirstH1,
} from "@/components/ui/MarkdownArticle";
import { UtilitiesDiaryArticle } from "@/components/ui/UtilitiesDiaryArticle";
import { parseFrontmatter } from "@/lib/guides";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

type Props = {
  params: Promise<{ lang: string }>;
};

const metaByLocale: Record<Locale, { title: string; description: string }> = {
  it: {
    title: "Rispetto ambiente | Vacanze alla Maddalena",
    description:
      "Guida di sensibilizzazione ambientale per proteggere spiagge e mare dell'arcipelago dai mozziconi.",
  },
  en: {
    title: "Environmental respect | La Maddalena Holidays",
    description:
      "Environmental awareness guide to protect beaches and sea in the archipelago from cigarette butts.",
  },
};

function getContent(locale: Locale): string | null {
  const file = path.join(process.cwd(), "content", locale, "rispetto-ambiente.md");
  if (fs.existsSync(file)) return fs.readFileSync(file, "utf8");
  const fallback = path.join(
    process.cwd(),
    "content",
    defaultLocale,
    "rispetto-ambiente.md"
  );
  if (fs.existsSync(fallback)) return fs.readFileSync(fallback, "utf8");
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return metaByLocale[lang];
}

export default async function RispettoAmbientePage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale = lang as Locale;
  const raw = getContent(locale);
  if (!raw) notFound();
  const { author, authorLink, polaroidCredits } = parseFrontmatter(raw);
  const firstH1 = parseBlocks(raw).find((block) => block.kind === "h1");
  const blocks = parseBlocksOmitFirstH1(raw);
  return (
    <div className="mx-auto max-w-content px-6 pb-24 pt-28 md:px-10 md:pt-36">
      <div className="mx-auto max-w-3xl">
        {firstH1 ? (
          <h1 className="mt-8 text-left font-serif text-4xl font-bold text-mare md:text-5xl">
            {firstH1.text}
          </h1>
        ) : null}
        <div className="mt-10">
          <UtilitiesDiaryArticle
            category="utilities"
            blocks={blocks}
            pageSlug="ecologia"
            locale={locale}
            defaultPhotoAuthor={author}
            defaultPhotoAuthorLink={authorLink}
            photoCreditsByBasename={polaroidCredits}
          />
        </div>
      </div>
    </div>
  );
}
