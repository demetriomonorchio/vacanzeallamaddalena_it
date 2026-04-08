// Server-only module — uses fs/path for markdown reading.
// Client Components must import from @/lib/categories instead.

import fs from "fs";
import path from "path";
import { cache } from "react";
import type { Locale } from "./i18n";
import { guidesByCategory, type Category } from "./categories";

// ─── Image helper (server-only) ───────────────────────────────────────────────

/**
 * Returns the public URL of the cover image for a guide if the corresponding
 * file exists at public/images/[category]/[slug].webp, otherwise null.
 */
export function getGuideImagePath(
  category: Category,
  slug: string
): string | null {
  const abs = path.join(
    process.cwd(),
    "public",
    "images",
    category,
    `${slug}.webp`
  );
  return fs.existsSync(abs) ? `/images/${category}/${slug}.webp` : null;
}

/**
 * Returns all guide entries for a category enriched with the `image` field
 * when the corresponding webp file exists in public/images/.
 */
export function getGuidesWithImages(
  category: Category
): import("./categories").GuideEntry[] {
  return guidesByCategory[category].map((guide) => ({
    ...guide,
    image: getGuideImagePath(category, guide.slug) ?? undefined,
  }));
}

// ─── Re-exports from the client-safe registry ─────────────────────────────────

// Re-export everything from the client-safe registry
export {
  categories,
  type Category,
  isCategory,
  categoryLabels,
  categoryMeta,
  type GuideEntry,
  guidesByCategory,
  getAllGuideRefs,
  isValidGuide,
  getCategoryForSlug,
} from "./categories";

// ─── Frontmatter parser (server-only) ────────────────────────────────────────

type FrontmatterData = {
  author?: string;
  authorLink?: string;
  googleMapsUrl?: string;
  polaroidCredits?: Record<string, { author?: string; authorLink?: string }>;
};

/**
 * Extracts `author`, `authorLink`, `googleMapsUrl` and optional per-polaroid credits.
 *
 * Supports both quoted and unquoted values, e.g.:
 *   author: "Mario Rossi"
 *   authorLink: https://unsplash.com/@mariorossi
 *   googleMapsUrl: https://maps.google.com/?q=...
 */
export function parseFrontmatter(raw: string): FrontmatterData {
  const lines = raw.replace(/^\uFEFF/, "").split(/\r?\n/);
  const openingIdx = lines.findIndex((l) => l.trim().length > 0);
  if (openingIdx === -1 || lines[openingIdx]?.trim() !== "---") return {};

  const closingIdx = lines.findIndex(
    (l, i) => i > openingIdx && l.trim() === "---"
  );
  if (closingIdx === -1) return {};

  const block = lines.slice(openingIdx + 1, closingIdx);
  const result: FrontmatterData = {};
  const perPolaroid: Record<string, { author?: string; authorLink?: string }> =
    {};

  for (const line of block) {
    const match = line.match(
      /^([a-zA-Z0-9_.-]+)\s*:\s*(?:"([^"]*)"|'([^']*)'|(.*))\s*$/
    );
    if (!match) continue;
    const key = match[1];
    const value = (match[2] ?? match[3] ?? match[4] ?? "").trim();
    if (key === "author") result.author = value.trim();
    if (key === "authorLink") result.authorLink = value.trim();
    if (key === "googleMapsUrl") result.googleMapsUrl = value.trim();

    if (key.startsWith("polaroidAuthor.")) {
      const basename = key.slice("polaroidAuthor.".length).trim().toLowerCase();
      if (!basename) continue;
      perPolaroid[basename] ??= {};
      perPolaroid[basename].author = value;
    }
    if (key.startsWith("polaroidAuthorLink.")) {
      const basename = key
        .slice("polaroidAuthorLink.".length)
        .trim()
        .toLowerCase();
      if (!basename) continue;
      perPolaroid[basename] ??= {};
      perPolaroid[basename].authorLink = value;
    }
  }

  if (Object.keys(perPolaroid).length > 0) {
    result.polaroidCredits = perPolaroid;
  }

  return result;
}

// ─── Content reader (server-only) ─────────────────────────────────────────────

export const getGuideRaw = cache(
  (locale: Locale, category: Category, slug: string): string | null => {
    const file = path.join(
      process.cwd(),
      "content",
      locale,
      category,
      `${slug}.md`
    );
    if (!fs.existsSync(file)) return null;
    return fs.readFileSync(file, "utf8");
  }
);
