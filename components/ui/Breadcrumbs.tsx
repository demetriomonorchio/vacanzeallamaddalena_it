import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { categoryLabels, type Category } from "@/lib/guides";
import type { Locale } from "@/lib/i18n";

type BreadcrumbsProps = {
  locale: Locale;
  category: Category;
  /** Present only on guide pages, not on category index pages */
  slug?: string;
  /** Human-readable label for the slug (falls back to slug with hyphens → spaces) */
  slugLabel?: string;
};

export function Breadcrumbs({
  locale,
  category,
  slug,
  slugLabel,
}: BreadcrumbsProps) {
  const catLabel = categoryLabels[category][locale];
  const readableSlug = slugLabel ?? slug?.replace(/-/g, " ");

  return (
    <nav
      aria-label={
        locale === "it" ? "Percorso di navigazione" : "Breadcrumb navigation"
      }
      className="flex flex-wrap items-center gap-1.5 font-sans text-xs text-slate/55"
    >
      <Link href={`/${locale}`} className="transition-colors hover:text-mare">
        Home
      </Link>

      <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />

      {slug ? (
        <>
          <Link
            href={`/${locale}/${category}`}
            className="capitalize transition-colors hover:text-mare"
          >
            {catLabel}
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />
          <span className="capitalize text-slate">{readableSlug}</span>
        </>
      ) : (
        <span className="capitalize text-slate">{catLabel}</span>
      )}
    </nav>
  );
}
