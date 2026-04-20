import type { MetadataRoute } from "next";
import { apartments, categories, getAllGuideRefs } from "@/lib/categories";
import { locales } from "@/lib/i18n";
import { siteUrl } from "@/lib/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  // Home pages
  for (const lang of locales) {
    entries.push({
      url: `${siteUrl}/${lang}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    });
  }

  // Appartamenti index page
  for (const lang of locales) {
    entries.push({
      url: `${siteUrl}/${lang}/appartamenti`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    });
  }

  // Appartamenti detail pages
  for (const lang of locales) {
    for (const apartment of apartments) {
      entries.push({
        url: `${siteUrl}/${lang}/appartamenti/${apartment.slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.9,
      });
    }
  }

  // Servizi page
  for (const lang of locales) {
    entries.push({
      url: `${siteUrl}/${lang}/servizi`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }

  // Category index pages
  for (const lang of locales) {
    for (const category of categories) {
      entries.push({
        url: `${siteUrl}/${lang}/${category}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }
  }

  // Individual guide pages
  const refs = getAllGuideRefs();
  for (const lang of locales) {
    for (const { category, slug } of refs) {
      entries.push({
        url: `${siteUrl}/${lang}/${category}/${slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
