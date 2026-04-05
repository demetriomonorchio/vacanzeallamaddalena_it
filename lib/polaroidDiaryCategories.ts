import type { Category } from "./categories";

/**
 * Guide pages in `[lang]/[category]/[slug]` that use layout Polaroid + bacheca (no hero .webp).
 * `utilities` usa la route dedicata `app/[lang]/utilities/[slug]`.
 */
export const POLAROID_DIARY_CATEGORIES = new Set<Category>([
  "attivita",
  "guida",
  "isole",
]);

export function isPolaroidDiaryCategory(cat: Category): boolean {
  return POLAROID_DIARY_CATEGORIES.has(cat);
}
