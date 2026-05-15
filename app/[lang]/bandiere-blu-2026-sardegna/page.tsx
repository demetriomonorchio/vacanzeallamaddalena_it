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
    title: "Bandiere Blu 2026 Sardegna | Vacanze alla Maddalena",
    description:
      "Le 17 località sarde premiate dalla FEE nel 2026, con l'ingresso di Teulada: elenco per area e criteri di sostenibilità.",
  },
  en: {
    title: "Blue Flag 2026 Sardinia | La Maddalena Holidays",
    description:
      "The 17 Sardinian locations awarded by FEE in 2026, including Teulada: list by area and sustainability criteria.",
  },
};

function getContent(locale: Locale): string | null {
  const file = path.join(
    process.cwd(),
    "content",
    locale,
    "bandiere-blu-2026-sardegna.md"
  );
  if (fs.existsSync(file)) return fs.readFileSync(file, "utf8");
  const fallback = path.join(
    process.cwd(),
    "content",
    defaultLocale,
    "bandiere-blu-2026-sardegna.md"
  );
  if (fs.existsSync(fallback)) return fs.readFileSync(fallback, "utf8");
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return metaByLocale[lang];
}

export default async function BandiereBlu2026SardegnaPage({ params }: Props) {
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
