import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
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
      if (t.includes("appartamento isola")) aptSlug = "isola";
      else if (t.includes("appartamento madda")) aptSlug = "madda";
      else if (t.includes("appartamento lena")) aptSlug = "lena";
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
  const { author, authorLink } = parseFrontmatter(raw);
  const photoByLabel = locale === "it" ? "Foto di" : "Photo by";
  const blocks = parseBlocksOmitFirstH1(raw);
  const { orphan, sections } = groupH2Sections(blocks);

  return (
    <div className="mx-auto max-w-content px-6 py-16 md:px-10 md:py-24">
      {/* Intro + sections from markdown with apartment polaroids */}
      <div className="mx-auto max-w-3xl">
        <article className="space-y-6 font-sans text-base leading-relaxed text-slate-800">
          <div className="space-y-6">
            {orphan.map((b, i) => renderMarkdownBlock(b, i))}
          </div>

          {sections.map((section, si) => {
            const apt = section.aptSlug
              ? apartments.find((a) => a.slug === section.aptSlug)
              : null;
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
                      />
                      {author ? (
                        <p className="relative z-20 mt-1.5 px-1 text-center text-xs italic leading-tight text-slate/70">
                          {authorLink ? (
                            <a
                              href={authorLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline-offset-2 transition-colors hover:text-mare hover:underline"
                            >
                              📷 {photoByLabel} {author}
                            </a>
                          ) : (
                            <span>
                              📷 {photoByLabel} {author}
                            </span>
                          )}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <h2
                    className={`font-serif text-2xl font-semibold text-mare ${
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
