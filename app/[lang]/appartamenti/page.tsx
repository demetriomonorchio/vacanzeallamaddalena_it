import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  parseBlocks,
  parseBlocksOmitFirstH1,
  renderInline,
  type MarkdownBlock,
} from "@/components/ui/MarkdownArticle";
import { UtilitiesPolaroidInner } from "@/components/ui/UtilitiesPolaroidInner";
import { apartments } from "@/lib/categories";
import { locales, isLocale, defaultLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { parseFrontmatter } from "@/lib/guides";
import { siteUrl, siteName } from "@/lib/metadata";
import { polaroidRotationDeg } from "@/lib/utilitiesImageSlug";

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

function getFrontmatterTitle(raw: string): string | null {
  const match = raw.match(/^\s*---[\s\S]*?\n\s*title:\s*["']?(.+?)["']?\s*\n[\s\S]*?---/m);
  return match?.[1]?.trim() || null;
}

function getPolaroidCredit(
  slug: "isola" | "madda" | "lena",
  credits?: Record<string, { author?: string; authorLink?: string }>
) {
  if (!credits) return {};
  const candidates = [slug, `appartamento-${slug}`, `apartment-${slug}`];
  for (const key of candidates) {
    const hit = credits[key];
    if (hit) return hit;
  }
  return {};
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

type ApartmentSection = {
  title: string;
  blocks: MarkdownBlock[];
  aptSlug?: "isola" | "madda" | "lena";
};

function groupH2Sections(blocks: MarkdownBlock[]) {
  const orphan: MarkdownBlock[] = [];
  const sections: ApartmentSection[] = [];
  let current: ApartmentSection | null = null;

  for (const b of blocks) {
    if (b.kind === "h2") {
      if (current) sections.push(current);
      const t = b.text.toLowerCase();
      let aptSlug: ApartmentSection["aptSlug"];
      if (t.includes("appartamento isola") || t.includes("isola apartment"))
        aptSlug = "isola";
      else if (t.includes("appartamento madda") || t.includes("madda apartment"))
        aptSlug = "madda";
      else if (t.includes("appartamento lena") || t.includes("lena apartment"))
        aptSlug = "lena";
      current = { title: b.text, blocks: [], aptSlug };
    } else if (current) {
      current.blocks.push(b);
    } else {
      orphan.push(b);
    }
  }
  if (current) sections.push(current);
  return { orphan, sections };
}

function renderMarkdownBlock(b: MarkdownBlock, i: number) {
  if (b.kind === "h3") {
    return (
      <h3 key={i} className="mt-8 font-serif text-lg font-semibold text-slate">
        {b.text}
      </h3>
    );
  }
  if (b.kind === "blockquote") {
    return (
      <aside
        key={i}
        className="not-prose mt-12 border-l-2 border-mare bg-mare/[0.04] px-6 py-5"
        aria-label="Consiglio editoriale"
      >
        <p className="font-sans text-sm leading-relaxed text-slate/85">
          {renderInline(b.text)}
        </p>
      </aside>
    );
  }
  if (b.kind === "ul") {
    return (
      <ul
        key={i}
        className="list-disc space-y-1.5 pl-6 text-pretty marker:text-mare md:columns-2 md:gap-x-8 [&>li]:break-inside-avoid"
      >
        {b.items.map((item, j) => (
          <li key={j} className="ps-1">
            {renderInline(item)}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p key={i} className="text-pretty">
      {renderInline(b.text)}
    </p>
  );
}

export default async function AppartamentiPage({ params }: Props) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const raw = getContent(locale);
  if (!raw) notFound();
  const { author, authorLink, polaroidCredits } = parseFrontmatter(raw);
  const photoByLabel = locale === "it" ? "Foto di" : "Photo by";
  const firstH1Block = parseBlocks(raw).find((block) => block.kind === "h1");
  const pageHeading = firstH1Block?.text ?? getFrontmatterTitle(raw) ?? pageMeta[locale].title;
  const blocks = parseBlocksOmitFirstH1(raw);
  const { orphan, sections } = groupH2Sections(blocks);

  return (
    <div className="mx-auto max-w-content px-6 pb-24 pt-28 md:px-10 md:pt-36">
      {/* Intro + sections from markdown with apartment polaroids */}
      <div className="mx-auto max-w-3xl">
        <article className="space-y-6 font-sans text-base leading-relaxed text-slate-800">
          <header className="mb-8">
            <h1 className="font-serif text-4xl font-semibold leading-tight text-slate md:text-5xl">
              {pageHeading}
            </h1>
          </header>
          <div className="space-y-6">
            {orphan.map((b, i) => renderMarkdownBlock(b, i))}
          </div>

          {sections.map((section, si) => {
            const apt = section.aptSlug
              ? apartments.find((a) => a.slug === section.aptSlug)
              : null;
            const perPolaroidCredit = section.aptSlug
              ? getPolaroidCredit(section.aptSlug, polaroidCredits)
              : {};
            const sideRight = si % 2 === 0;
            const floatClass = sideRight
              ? "float-right mb-4 ml-10 md:ml-12"
              : "float-left mb-4 mr-10 md:mr-12";
            return (
              <section key={`apt-section-${si}`} className="space-y-6">
                <div className="text-pretty">
                  {apt ? (
                    <div className={`${floatClass} w-[11rem] max-w-[40%] md:w-[13rem]`}>
                      <UtilitiesPolaroidInner
                        src={apt.image}
                        expectedBasename={apt.slug}
                        category="isole"
                        pageSlug={apt.slug}
                        rotationDeg={polaroidRotationDeg(`appartamenti:${apt.slug}`)}
                        missingLabel={locale === "it" ? "Immagine assente" : "Image missing"}
                        photoCreditLabel={photoByLabel}
                        photoCreditAuthor={perPolaroidCredit.author ?? author}
                        photoCreditLink={perPolaroidCredit.authorLink ?? authorLink}
                        disableLightbox
                      />
                    </div>
                  ) : null}

                  <h2
                    className={`font-serif text-3xl font-semibold leading-tight text-slate ${
                      si > 0 || orphan.length > 0 ? "mt-12" : ""
                    }`}
                  >
                    {section.title}
                  </h2>

                  <div className="mt-6 space-y-6">
                    {section.blocks.map((b, bi) =>
                      renderMarkdownBlock(b, si * 1000 + bi)
                    )}
                  </div>
                  <div className="clear-both" aria-hidden />
                </div>
              </section>
            );
          })}
        </article>
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
