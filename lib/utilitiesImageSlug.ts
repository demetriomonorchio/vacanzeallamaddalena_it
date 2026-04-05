/**
 * Client-safe: derive the utilities Polaroid PNG basename from a heading title.
 */
export function titleToUtilitiesImageSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Basename for `.../utilities/[pageSlug]/[basename].png`.
 * - With `imgName`: use it as-is (normalized, safe chars only).
 * - Without: slug from the first 3 words of the display title only.
 */
export function polaroidImageBasename(
  displayTitle: string,
  imgName?: string
): string {
  const key = imgName?.trim();
  if (key) {
    return key
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/[^a-z0-9-]/gi, "")
      .replace(/^-+|-+$/g, "");
  }
  const words = displayTitle
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .join(" ");
  return titleToUtilitiesImageSlug(words);
}

/**
 * Optional `## Visible title | file-key` — file-key becomes img basename; pipe not shown in UI.
 */
export function parseUtilitiesH2Heading(raw: string): {
  displayTitle: string;
  imgName?: string;
} {
  const trimmed = raw.trim();
  const m = trimmed.match(
    /^(.+?)\s*\|\s*([a-zA-Z0-9][-a-zA-Z0-9]*)\s*$/
  );
  if (m) {
    return {
      displayTitle: m[1].trim(),
      imgName: m[2].trim().toLowerCase(),
    };
  }
  return { displayTitle: trimmed };
}

/** Deterministic rotation in degrees ∈ [-2, 2] for stable SSR/client output. */
export function polaroidRotationDeg(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const steps = [-2, -1, 0, 1, 2] as const;
  return steps[Math.abs(h) % steps.length];
}
