export const locales = ["it", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "it";

export function isLocale(s: string): s is Locale {
  return locales.includes(s as Locale);
}
