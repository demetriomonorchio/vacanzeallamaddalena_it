export const PUBLISH_TIME = "19:00";

/** Martedì luogo o attività, sabato guida pratica. Ore 19:00, fuso di Roma. */
export const instagramSchedule = [
  { date: "2026-10-31", category: "guida", slug: "quando-venire" },
  { date: "2026-11-03", category: "isole", slug: "caprera" },
  { date: "2026-11-07", category: "utilities", slug: "come-arrivare" },
  { date: "2026-11-10", category: "isole", slug: "spiagge-budelli-spargi" },
  { date: "2026-11-14", category: "guida", slug: "venti" },
  { date: "2026-11-17", category: "isole", slug: "isole-minori" },
  { date: "2026-11-21", category: "guida", slug: "spiagge" },
  { date: "2026-11-24", category: "attivita", slug: "tour-barca" },
  { date: "2026-11-28", category: "utilities", slug: "parco-nazionale" },
  { date: "2026-12-01", category: "attivita", slug: "trekking" },
  { date: "2026-12-05", category: "attivita", slug: "vela" },
  { date: "2026-12-08", category: "guida", slug: "luce-fotografia" },
  { date: "2026-12-12", category: "utilities", slug: "vivere-il-borgo" },
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
