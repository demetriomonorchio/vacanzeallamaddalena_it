import {
  polaroidImageBasename,
  polaroidRotationDeg,
} from "@/lib/utilitiesImageSlug";
import { guidePolaroidPngExists } from "@/lib/guidePolaroidImage";
import { UtilitiesPolaroidInner } from "@/components/ui/UtilitiesPolaroidInner";
import type { Category } from "@/lib/categories";
import type { Locale } from "@/lib/i18n";

type Props = {
  category: Category;
  /** Titolo sezione (senza `| img`): basename PNG, testo alternativo immagine, aria sulla figura. */
  title: string;
  /**
   * Titolo (tipicamente IT) usato solo per basename / prime 3 parole.
   * Se omesso, coincide con `title`.
   */
  basenameSourceTitle?: string;
  /** Sottocartella sotto `public/images/utilities/` (es. parco-nazionale). */
  slug: string;
  /** Indice sezione per float alternato. */
  index: number;
  /**
   * Basename file senza `.png` (es. `flora`). Se assente: prime 3 parole del titolo pulite.
   */
  imgName?: string;
  locale: Locale;
};

export function UtilitiesImageCard({
  category,
  title,
  basenameSourceTitle,
  slug,
  index,
  imgName,
  locale,
}: Props) {
  const sourceForFile = basenameSourceTitle ?? title;
  const basename = polaroidImageBasename(sourceForFile, imgName);
  const hasImage = guidePolaroidPngExists(
    category,
    slug,
    sourceForFile,
    imgName
  );
  const src = hasImage
    ? `/images/${category}/${slug}/${basename}.png`
    : null;
  const rotationDeg = polaroidRotationDeg(`${category}/${slug}:${basename}`);
  const sideRight = index % 2 === 0;
  const floatClass = sideRight
    ? "float-right mb-4 ml-10 md:ml-12"
    : "float-left mb-4 mr-10 md:mr-12";

  const missingLabel =
    locale === "it" ? "Immagine assente" : "Image missing";

  return (
    <UtilitiesPolaroidInner
      src={src}
      expectedBasename={basename}
      category={category}
      pageSlug={slug}
      rotationDeg={rotationDeg}
      missingLabel={missingLabel}
      className={`${floatClass} w-[11rem] max-w-[40%] md:w-[13rem]`}
    />
  );
}
