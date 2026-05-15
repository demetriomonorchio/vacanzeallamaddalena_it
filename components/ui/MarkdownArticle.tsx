import type { ReactNode } from "react";

// ─── Frontmatter stripping ────────────────────────────────────────────────────

function stripFrontmatter(source: string): string {
  const lines = source.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") return source;
  const closingIdx = lines.findIndex((l, i) => i > 0 && l.trim() === "---");
  if (closingIdx === -1) return source;
  return lines.slice(closingIdx + 1).join("\n");
}

// ─── Inline renderer — bold + links ──────────────────────────────────────────

const INLINE_RE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

export function renderInline(text: string): ReactNode[] {
  const parts = text.split(INLINE_RE);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-slate">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const isExternal = linkMatch[2].startsWith("http");
      return (
        <a
          key={i}
          href={linkMatch[2]}
          className="font-medium text-mare underline underline-offset-4 transition-opacity hover:opacity-75"
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
}

// ─── Block parser ─────────────────────────────────────────────────────────────

export type MarkdownBlock =
  | { kind: "h1"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "blockquote"; text: string }
  | { kind: "ul"; items: string[] };

export function parseBlocks(source: string): MarkdownBlock[] {
  const clean = stripFrontmatter(source).trim();
  const lines = clean.split(/\r?\n/);
  const blocks: MarkdownBlock[] = [];
  let buf: string[] = [];
  let quoteBuf: string[] = [];
  let listBuf: string[] = [];

  const flushParagraph = () => {
    const t = buf.join("\n").trim();
    if (t) blocks.push({ kind: "p", text: t });
    buf = [];
  };

  const flushQuote = () => {
    const t = quoteBuf.join(" ").trim();
    if (t) blocks.push({ kind: "blockquote", text: t });
    quoteBuf = [];
  };

  const flushList = () => {
    if (listBuf.length > 0) {
      blocks.push({ kind: "ul", items: [...listBuf] });
      listBuf = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const h3 = line.match(/^###\s+(.+)/);
    const h2 = line.match(/^##\s+(.+)/);
    const h1 = line.match(/^#\s+(.+)/);
    const bq = line.match(/^>\s?(.*)/);
    const ul = line.match(/^-\s+(.+)/);

    if (h1 && !h2 && !h3) {
      flushParagraph();
      flushQuote();
      flushList();
      blocks.push({ kind: "h1", text: h1[1].trim() });
      continue;
    }
    if (h2 && !h3) {
      flushParagraph();
      flushQuote();
      flushList();
      blocks.push({ kind: "h2", text: h2[1].trim() });
      continue;
    }
    if (h3) {
      flushParagraph();
      flushQuote();
      flushList();
      blocks.push({ kind: "h3", text: h3[1].trim() });
      continue;
    }
    if (bq !== null) {
      flushParagraph();
      flushList();
      quoteBuf.push(bq[1]);
      continue;
    }
    if (ul) {
      flushParagraph();
      flushQuote();
      listBuf.push(ul[1].trim());
      continue;
    }
    if (line.trim() === "") {
      flushParagraph();
      flushQuote();
      // Non chiudere la lista se la prossima riga non vuota è ancora un elenco (- …):
      // altrimenti ogni riga vuota tra bullet crea un <ul> da un solo elemento e enormi spazi verticali.
      if (listBuf.length > 0) {
        let j = i + 1;
        while (j < lines.length && lines[j]!.trim() === "") j++;
        const next = (lines[j] ?? "").trim();
        if (/^-\s+/.test(next)) {
          continue;
        }
      }
      flushList();
    } else {
      if (quoteBuf.length > 0) flushQuote();
      flushList();
      buf.push(line);
    }
  }
  flushParagraph();
  flushQuote();
  flushList();
  return blocks;
}

/** Blocchi markdown dopo aver omesso il primo titolo `#` (già mostrato come h1 di pagina). */
export function parseBlocksOmitFirstH1(source: string): MarkdownBlock[] {
  const allBlocks = parseBlocks(source);
  let skipped = false;
  return allBlocks.filter((b) => {
    if (!skipped && b.kind === "h1") {
      skipped = true;
      return false;
    }
    return true;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MarkdownArticle({
  source,
  suppressFirstH1 = false,
}: {
  source: string;
  suppressFirstH1?: boolean;
}) {
  const allBlocks = parseBlocks(source);

  // When suppressFirstH1 is true, skip the very first h1 block (already
  // rendered as the page title in the parent layout).
  let skipped = false;
  const blocks = suppressFirstH1
    ? allBlocks.filter((b) => {
        if (!skipped && b.kind === "h1") {
          skipped = true;
          return false;
        }
        return true;
      })
    : allBlocks;

  return (
    <article className="mx-auto max-w-3xl space-y-6 font-sans text-base leading-relaxed text-slate-800">
      {blocks.map((b, i) => {
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
      })}
    </article>
  );
}
