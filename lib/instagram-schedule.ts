export const PUBLISH_TIME = "19:00";

/**
 * Seed iniziale del calendario (scelta editoriale mar/sab 19:00).
 * La sorgente operativa è Neon (`scheduled_for`); queste date si applicano
 * solo se la riga non ha ancora una data.
 */
export const instagramSchedule = [
  // già pubblicati (storico)
  { date: "2026-10-31", category: "guida", slug: "quando-venire" },
  { date: "2026-11-03", category: "isole", slug: "caprera" },
  { date: "2026-11-07", category: "utilities", slug: "come-arrivare" },
  { date: "2026-11-10", category: "isole", slug: "spiagge-budelli-spargi" },
  { date: "2026-11-14", category: "guida", slug: "venti" },
  { date: "2026-11-17", category: "isole", slug: "isole-minori" },
  // da pubblicare nov–dic 2026
  { date: "2026-11-15", category: "guida", slug: "spiagge" },
  { date: "2026-11-18", category: "attivita", slug: "tour-barca" },
  { date: "2026-11-22", category: "utilities", slug: "parco-nazionale" },
  { date: "2026-11-25", category: "attivita", slug: "trekking" },
  { date: "2026-11-29", category: "guida", slug: "luce-fotografia" },
  { date: "2026-12-02", category: "utilities", slug: "vivere-il-borgo" },
  { date: "2026-12-06", category: "guida", slug: "food" },
  { date: "2026-12-09", category: "utilities", slug: "ecologia" },
  { date: "2026-12-13", category: "utilities", slug: "servizi" },
  // febbraio 2027 (blocco mare / primavera)
  { date: "2027-02-10", category: "attivita", slug: "vela" },
  { date: "2027-02-14", category: "attivita", slug: "diving-snorkeling" },
  { date: "2027-02-17", category: "attivita", slug: "kayak-sport-acquatici" },
  { date: "2027-02-21", category: "attivita", slug: "puntiimmersione" },
] as const;

export type ScheduledPost = (typeof instagramSchedule)[number];

export function romeToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function atNoon(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

export function formatPublishWhen(iso: string) {
  const label = new Intl.DateTimeFormat("it-IT", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(atNoon(iso));
  return `${label} · ${PUBLISH_TIME}`;
}

/** Data/ora reale di pubblicazione (fuso di Roma). */
export function formatPublishedAt(iso: string) {
  return new Intl.DateTimeFormat("it-IT", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  }).format(new Date(iso));
}

export function formatPublishLong(iso: string) {
  const label = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(atNoon(iso));
  return `${label} alle ${PUBLISH_TIME}`;
}

export function scheduleFor(category: string, slug: string) {
  return instagramSchedule.find((item) => item.category === category && item.slug === slug);
}
