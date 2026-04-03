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
