import fs from "fs";
import path from "path";
import type { Category } from "./categories";
import { polaroidImageBasename } from "./utilitiesImageSlug";

/**
 * Server-only: true se esiste `public/images/[category]/[pageSlug]/[basename].png`.
 */
export function guidePolaroidPngExists(
  category: Category,
  pageSlug: string,
  displayTitle: string,
  imgName?: string
): boolean {
  const basename = polaroidImageBasename(displayTitle, imgName);
  const abs = path.join(
    process.cwd(),
    "public",
    "images",
    category,
    pageSlug,
    `${basename}.png`
  );
  return fs.existsSync(abs);
}
