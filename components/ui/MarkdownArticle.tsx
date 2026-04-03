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

function renderInline(text: string): ReactNode[] {
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

type Block =
  | { kind: "h1"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "blockquote"; text: string };

function parseBlocks(source: string): Block[] {
  const clean = stripFrontmatter(source).trim();
  const lines = clean.split(/\r?\n/);
  const blocks: Block[] = [];
  let buf: string[] = [];
  let quoteBuf: string[] = [];

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

  for (const line of lines) {
    const h3 = line.match(/^###\s+(.+)/);
    const h2 = line.match(/^##\s+(.+)/);
    const h1 = line.match(/^#\s+(.+)/);
    const bq = line.match(/^>\s?(.*)/);

    if (h1 && !h2 && !h3) {
      flushParagraph();
      flushQuote();
      blocks.push({ kind: "h1", text: h1[1].trim() });
      continue;
    }
    if (h2 && !h3) {
      flushParagraph();
      flushQuote();
      blocks.push({ kind: "h2", text: h2[1].trim() });
      continue;
    }
    if (h3) {
      flushParagraph();
      flushQuote();
      blocks.push({ kind: "h3", text: h3[1].trim() });
      continue;
    }
    if (bq !== null) {
      flushParagraph();
      quoteBuf.push(bq[1]);
      continue;
    }
    if (line.trim() === "") {
      flushParagraph();
      flushQuote();
    } else {
      if (quoteBuf.length > 0) flushQuote();
      buf.push(line);
    }
  }
  flushParagraph();
  flushQuote();
  return blocks;
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
        return (
          <p key={i} className="text-pretty">
            {renderInline(b.text)}
          </p>
        );
      })}
    </article>
  );
}
