import fs from "fs";
import path from "path";
import type { Category } from "./categories";
import { polaroidImageBasename } from "./utilitiesImageSlug";

/**
 * Server-only: returns image public path if file exists.
 * Preferred order: `.webp`, fallback `.png`.
 */
export function guidePolaroidImageSrc(
  category: Category,
  pageSlug: string,
  displayTitle: string,
  imgName?: string
): string | null {
  const basename = polaroidImageBasename(displayTitle, imgName);
  const exts = ["webp", "png"] as const;

  for (const ext of exts) {
    const abs = path.join(
      process.cwd(),
      "public",
      "images",
      category,
      pageSlug,
      `${basename}.${ext}`
    );
    if (fs.existsSync(abs)) {
      return `/images/${category}/${pageSlug}/${basename}.${ext}`;
    }
  }

  return null;
}
