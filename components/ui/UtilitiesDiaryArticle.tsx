import {
  renderInline,
  type MarkdownBlock,
} from "@/components/ui/MarkdownArticle";
import { UtilitiesImageCard } from "@/components/ui/UtilitiesImageCard";
import type { Category } from "@/lib/categories";
import type { Locale } from "@/lib/i18n";
import { parseUtilitiesH2Heading } from "@/lib/utilitiesImageSlug";

type DiarySection = {
  displayTitle: string;
  imgName?: string;
  blocks: MarkdownBlock[];
};

function groupH2Sections(blocks: MarkdownBlock[]) {
  const orphan: MarkdownBlock[] = [];
  const sections: DiarySection[] = [];
  let current: DiarySection | null = null;

  for (const b of blocks) {
    if (b.kind === "h2") {
      if (current) sections.push(current);
      const { displayTitle, imgName } = parseUtilitiesH2Heading(b.text);
      current = { displayTitle, imgName, blocks: [] };
    } else if (current) {
      current.blocks.push(b);
    } else {
      orphan.push(b);
    }
  }
  if (current) sections.push(current);
  return { orphan, sections };
}

function renderMarkdownBlock(
  b: MarkdownBlock,
  i: number,
  locale: Locale,
  quoteAriaIt: string,
  quoteAriaEn: string
) {
  const quoteAria = locale === "it" ? quoteAriaIt : quoteAriaEn;

  if (b.kind === "h1") {
    return (
      <h1
        key={i}
        className="font-serif text-4xl font-semibold text-mare md:text-5xl"
      >
        {b.text}
      </h1>
    );
  }
  if (b.kind === "h2") {
    return (
      <h2
        key={i}
        className="mt-12 font-serif text-2xl font-semibold text-mare first:mt-0"
      >
        {b.text}
      </h2>
    );
  }
  if (b.kind === "h3") {
    return (
      <h3
        key={i}
        className="mt-8 font-serif text-lg font-semibold text-slate"
      >
        {b.text}
      </h3>
    );
  }
  if (b.kind === "blockquote") {
    return (
      <aside
        key={i}
        className="not-prose mt-12 border-l-2 border-mare bg-mare/[0.04] px-6 py-5"
        aria-label={quoteAria}
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

type Props = {
  category: Category;
  blocks: MarkdownBlock[];
  /**
   * Markdown IT (stesso slug) per basename PNG e `| img` di fallback: una sola cartella immagini per tutte le lingue.
   */
  polaroidKeyBlocks?: MarkdownBlock[];
  pageSlug: string;
  locale: Locale;
};

export function UtilitiesDiaryArticle({
  category,
  blocks,
  polaroidKeyBlocks,
  pageSlug,
  locale,
}: Props) {
  const { orphan, sections } = groupH2Sections(blocks);
  const itGrouped = polaroidKeyBlocks
    ? groupH2Sections(polaroidKeyBlocks)
    : null;
  const quoteAriaIt = "Consiglio editoriale";
  const quoteAriaEn = "Editorial note";

  return (
    <article className="space-y-6 font-sans text-base leading-relaxed text-slate-800">
      <div className="space-y-6">
        {orphan.map((b, i) =>
          renderMarkdownBlock(b, i, locale, quoteAriaIt, quoteAriaEn)
        )}
      </div>

      {sections.map((section, si) => {
        const itSec = itGrouped?.sections[si];
        const mergedImgName = section.imgName ?? itSec?.imgName;
        const basenameSourceTitle = itSec?.displayTitle ?? section.displayTitle;

        return (
        <section
          key={`${pageSlug}-section-${si}`}
          className="space-y-6"
        >
          <div className="text-pretty">
            <UtilitiesImageCard
              category={category}
              title={section.displayTitle}
              basenameSourceTitle={basenameSourceTitle}
              slug={pageSlug}
              index={si}
              imgName={mergedImgName}
              locale={locale}
            />
            <h2
              className={`font-serif text-2xl font-semibold text-mare ${
                si > 0 || orphan.length > 0 ? "mt-12" : ""
              }`}
            >
              {section.displayTitle}
            </h2>
            <div className="mt-6 space-y-6">
              {section.blocks.map((b, bi) =>
                renderMarkdownBlock(
                  b,
                  si * 1000 + bi,
                  locale,
                  quoteAriaIt,
                  quoteAriaEn
                )
              )}
            </div>
            <div className="clear-both" aria-hidden />
          </div>
        </section>
        );
      })}
    </article>
  );
}
