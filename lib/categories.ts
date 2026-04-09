// Client-safe registry — no Node.js / fs dependencies.
// Imported by both Server Components and Client Components (Navbar).

import type { Locale } from "./i18n";

// ─── Categories ───────────────────────────────────────────────────────────────

export const categories = ["isole", "attivita", "guida", "utilities"] as const;
export type Category = (typeof categories)[number];

export function isCategory(s: string): s is Category {
  return (categories as readonly string[]).includes(s);
}

export const categoryLabels: Record<Category, Record<Locale, string>> = {
  isole:     { it: "Isole",         en: "Islands"       },
  attivita:  { it: "Attività",      en: "Activities"    },
  guida:     { it: "Guida Insider", en: "Insider Guide" },
  utilities: { it: "Utilità",       en: "Utilities"     },
};

export const categoryMeta: Record<
  Category,
  Record<Locale, { title: string; intro: string }>
> = {
  isole: {
    it: {
      title: "Le isole dell'arcipelago",
      intro:
        "Sette isole, ognuna con un carattere diverso. Dalla Maddalena a Budelli, una mappa per orientarsi senza fretta.",
    },
    en: {
      title: "Islands of the archipelago",
      intro:
        "Seven islands, each with its own character. From La Maddalena to Budelli, a map for unhurried orientation.",
    },
  },
  attivita: {
    it: {
      title: "Cosa fare nell'arcipelago",
      intro:
        "In barca, sott'acqua, a vela o a piedi: le attività che rendono l'arcipelago un luogo di scoperta continua.",
    },
    en: {
      title: "What to do in the archipelago",
      intro:
        "By boat, underwater, under sail or on foot: activities that make the archipelago a place of continuous discovery.",
    },
  },
  guida: {
    it: {
      title: "Guida Insider",
      intro:
        "Venti, spiagge, tavola e stagioni. Le letture per chi vuole vivere l'arcipelago come un habitué, non come un ospite.",
    },
    en: {
      title: "Insider Guide",
      intro:
        "Winds, beaches, food and seasons. Reads for those who want to live the archipelago like a regular, not a visitor.",
    },
  },
  utilities: {
    it: {
      title: "Informazioni pratiche",
      intro:
        "Permessi Parco, traghetti, servizi e numeri utili. Tutto ciò che serve sapere prima di partire e durante il soggiorno.",
    },
    en: {
      title: "Practical information",
      intro:
        "Park permits, ferries, services and useful numbers. Everything you need before you travel and during your stay.",
    },
  },
};

// ─── Guide entries ────────────────────────────────────────────────────────────

export type GuideEntry = {
  slug: string;
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  /** Populated server-side via getGuideImagePath(); undefined on the client. */
  image?: string;
  /** Photo author name, parsed from markdown frontmatter (server-only). */
  author?: string;
  /** URL to the author's portfolio/profile, parsed from markdown frontmatter. */
  authorLink?: string;
  /** Google Maps URL, parsed from markdown frontmatter (server-only). */
  googleMapsUrl?: string;
};

export const guidesByCategory: Record<Category, readonly GuideEntry[]> = {
  isole: [
    {
      slug: "la-maddalena",
      title: { it: "Isola di La Maddalena", en: "La Maddalena Island" },
      excerpt: {
        it: "Cala Gavetta, il borgo storico e Guardia Vecchia: l'isola principale come centro operativo per l'intero arcipelago.",
        en: "Cala Gavetta, the historic village and Guardia Vecchia: the main island as operational base for the entire archipelago.",
      },
    },
    {
      slug: "caprera",
      title: { it: "Isola di Caprera", en: "Caprera Island" },
      excerpt: {
        it: "Garibaldi, Stagnali, Punta Rossa e Cala Coticcio: l'isola che non si capisce in un giorno e non si dimentica dopo averla capita.",
        en: "Garibaldi, Stagnali, Punta Rossa and Cala Coticcio: the island you can't understand in a day and won't forget once you do.",
      },
    },
    {
      slug: "isole-minori",
      title: { it: "Le isole minori", en: "The outer islands" },
      excerpt: {
        it: "Santo Stefano, Santa Maria e Razzoli: le isole che si vedono dall'orizzonte e si raggiungono solo quando il vento lo permette.",
        en: "Santo Stefano, Santa Maria and Razzoli: islands seen on the horizon and reached only when the wind allows.",
      },
    },
    {
      slug: "spiagge-budelli-spargi",
      title: { it: "Budelli e Spargi", en: "Budelli and Spargi" },
      excerpt: {
        it: "Spiaggia Rosa protetta dal 1994, Cala Corsara e il relitto romano: le due isole da raggiungere via mare.",
        en: "The Pink Beach protected since 1994, Cala Corsara and the Roman wreck: two islands worth reaching by boat.",
      },
    },
  ],
  attivita: [
    {
      slug: "diving-snorkeling",
      title: { it: "Diving e snorkeling", en: "Diving and snorkelling" },
      excerpt: {
        it: "La Secca di Mezzo, il relitto romano di Spargi e una visibilità di 25 metri: i fondali dell'arcipelago per chi vuole capirli davvero.",
        en: "The Secca di Mezzo, the Roman wreck at Spargi and 25-metre visibility: the archipelago seabed for those who want to understand it properly.",
      },
    },
    {
      slug: "vela",
      title: { it: "Vela nell'arcipelago", en: "Sailing the archipelago" },
      excerpt: {
        it: "Le Bocche di Bonifacio come scuola naturale, il Centro Velico di Stagnali e le regate che hanno reso La Maddalena la capitale della vela italiana.",
        en: "The Bocche di Bonifacio as a natural school, the Stagnali sailing centre and the regattas that made La Maddalena Italy's sailing capital.",
      },
    },
    {
      slug: "trekking",
      title: { it: "Trekking sull'arcipelago", en: "Trekking the archipelago" },
      excerpt: {
        it: "Il granito rosa, il mirto e il blu del mare che appare oltre ogni crinale: i sentieri di Caprera e Guardia Vecchia per chi vuole leggere il territorio con i piedi.",
        en: "Pink granite, myrtle and the blue sea appearing beyond every ridge: Caprera and Guardia Vecchia trails for those who want to read the land on foot.",
      },
    },
    {
      slug: "tour-barca",
      title: { it: "Tour in barca", en: "Boat tours" },
      excerpt: {
        it: "I barconi storici di Cala Gavetta, l'Apollo II e il noleggio autonomo: tre logiche di navigazione diverse per scegliere quella giusta in base al vento.",
        en: "Historic vessels from Cala Gavetta, the Apollo II vintage schooner and self-hire: three navigation approaches — choose based on the wind.",
      },
    },
    {
      slug: "kayak-sport-acquatici",
      title: { it: "Kayak e sport acquatici", en: "Kayak and water sports" },
      excerpt: {
        it: "Le calette di Caprera in kayak all'alba, il SUP nelle acque piatte di Porto Massimo e il pescaturismo con i pescatori locali: i modi lenti e veri di stare sull'acqua.",
        en: "Caprera coves by kayak at dawn, SUP on the flat water of Porto Massimo and pescaturismo with local fishermen: the slow, authentic ways to be on the water.",
      },
    },
  ],
  guida: [
    {
      slug: "venti",
      title: { it: "I venti dell'arcipelago", en: "Archipelago winds" },
      excerpt: {
        it: "Maestrale, Scirocco, Libeccio: una mappa meteorologica per scegliere la spiaggia giusta ogni giorno.",
        en: "Mistral, Scirocco, Libeccio: a meteorological map to choose the right beach every day.",
      },
    },
    {
      slug: "spiagge",
      title: { it: "Spiagge e silenzio", en: "Beaches and silence" },
      excerpt: {
        it: "Dove andare per vento, ora e stagione. Le calette fuori dai radar e quelle che cambiano ad ogni luce.",
        en: "Where to go by wind, hour and season. Off-radar coves and those that change with every light.",
      },
    },
    {
      slug: "food",
      title: { it: "Tavola di porto", en: "Harbour table" },
      excerpt: {
        it: "Pesce di rete, granita come rito, Vermentino freddo. Mangiare a La Maddalena senza algoritmi.",
        en: "Net fish, granite ice as ritual, cold Vermentino. Eating in La Maddalena without algorithms.",
      },
    },
    {
      slug: "quando-venire",
      title: { it: "Quando venire", en: "When to visit" },
      excerpt: {
        it: "Aprile cristallino, giugno perfetto, agosto onesto e settembre segreto: l'arcipelago cambia anima ogni trenta giorni. La guida alle stagioni per chi vuole scegliere bene.",
        en: "Crystalline April, perfect June, honest August and secret September: the archipelago changes character every thirty days. The seasonal guide for those who want to choose well.",
      },
    },
    {
      slug: "luce-fotografia",
      title: { it: "Luce e fotografia", en: "Light and photography" },
      excerpt: {
        it: "Il granito diafano all'alba di Punta Tegge, i riflessi di Cala Coticcio alle dieci del mattino, il tramonto verso la Corsica da Guardia Vecchia: dove e quando trovare la luce migliore dell'arcipelago.",
        en: "The diaphanous granite at dawn on Punta Tegge, the reflections of Cala Coticcio at ten in the morning, the sunset towards Corsica from Guardia Vecchia: where and when to find the archipelago's finest light.",
      },
    },
  ],
  utilities: [
    {
      slug: "parco-nazionale",
      title: { it: "Il Parco Nazionale", en: "The National Park" },
      excerpt: {
        it: "18.000 ettari, 180 km di coste, Santuario Pelagos: permessi, zone e regole.",
        en: "18,000 hectares, 180 km of coastline, Pelagos Sanctuary: permits, zones and rules.",
      },
    },
    {
      slug: "ecologia",
      title: { it: "Turismo consapevole", en: "Responsible tourism" },
      excerpt: {
        it: "Codice di Buona Condotta, arcipelago senza plastica e Posidonia: come visitare il Parco rispettando il territorio.",
        en: "Code of Good Conduct, plastic-free archipelago and Posidonia: how to visit the Park with genuine care.",
      },
    },
    {
      slug: "vivere-il-borgo",
      title: { it: "Vivere il borgo", en: "Living the village" },
      excerpt: {
        it: "Traghetti, bus, mercato, farmacie e numeri utili. La guida pratica per chi soggiorna nell'arcipelago.",
        en: "Ferries, buses, market, pharmacies and useful numbers. The practical guide for archipelago stays.",
      },
    },
    {
      slug: "come-arrivare",
      title: { it: "Come arrivare", en: "Getting here" },
      excerpt: {
        it: "Il traghetto da Palau (Delcomar o Maddalena Lines), come prenotare in agosto senza code, e come muoversi sull'isola: auto, scooter o bici elettrica.",
        en: "The ferry from Palau (Delcomar or Maddalena Lines), how to book in August without queuing, and how to get around the island: car, scooter or e-bike.",
      },
    },
    {
      slug: "servizi",
      title: { it: "Servizi sull'isola", en: "Island services" },
      excerpt: {
        it: "Supermercati, farmacie di turno, bancomat, numeri utili e WiFi: tutto quello che serve sapere per soggiornare in appartamento senza sorprese.",
        en: "Supermarkets, duty pharmacies, ATMs, emergency contacts and WiFi: everything you need for a self-catering stay without surprises.",
      },
    },
    {
      slug: "vela",
      title: { it: "Servizi vela", en: "Sailing services" },
      excerpt: {
        it: "Scuole, uscite in veliero, basi nautiche e ormeggi: i riferimenti pratici per organizzare giornate a vela nell'arcipelago.",
        en: "Schools, day sails, marinas and moorings: practical references to plan sailing days in the archipelago.",
      },
    },
  ],
};

// ─── Apartment entries ────────────────────────────────────────────────────────

export type ApartmentEntry = {
  slug: string;
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  /** Hero cover image shown at the top of the detail page. */
  image: string;
  /** Ordered gallery images shown below the article text. */
  gallery: readonly string[];
};

export const apartments: readonly ApartmentEntry[] = [
  {
    slug: "isola",
    title: {
      it: "Appartamento Isola",
      en: "Isola Apartment",
    },
    excerpt: {
      it: "Tra calette e silenzio — la base giusta per chi vuole l'arcipelago tutto per sé.",
      en: "Between coves and quiet — the right base for those who want the archipelago to themselves.",
    },
    image: "/images/appartamenti/isola/hero.jpg",
    gallery: [
      "/images/appartamenti/isola/isola-1.jpg",
      "/images/appartamenti/isola/isola-2.jpg",
      "/images/appartamenti/isola/isola-3.jpg",
      "/images/appartamenti/isola/isola-4.jpg",
      "/images/appartamenti/isola/isola-5.jpg",
      "/images/appartamenti/isola/isola-6.jpg",
      "/images/appartamenti/isola/isola-7.jpg",
      "/images/appartamenti/isola/isola-8.jpg",
    ],
  },
  {
    slug: "madda",
    title: {
      it: "Appartamento Madda",
      en: "Madda Apartment",
    },
    excerpt: {
      it: "Al centro del borgo, a pochi minuti dal porto e dal mercato del mattino.",
      en: "In the village centre, minutes from the port and the morning market.",
    },
    image: "/images/appartamenti/madda/hero.jpg",
    gallery: [
      "/images/appartamenti/madda/madda-1.jpg",
      "/images/appartamenti/madda/madda-2.jpg",
      "/images/appartamenti/madda/madda-3.jpg",
      "/images/appartamenti/madda/madda-4.jpg",
      "/images/appartamenti/madda/madda-5.jpg",
      "/images/appartamenti/madda/madda-6.jpg",
      "/images/appartamenti/madda/madda-7.jpg",
      "/images/appartamenti/madda/madda-8.jpg",
    ],
  },
  {
    slug: "lena",
    title: {
      it: "Appartamento Lena",
      en: "Lena Apartment",
    },
    excerpt: {
      it: "Luminosa, essenziale. Con la vista che dice tutto il resto.",
      en: "Light-filled, essential. With a view that says the rest.",
    },
    image: "/images/appartamenti/lena/hero.jpg",
    gallery: [
      "/images/appartamenti/lena/lena-1.jpg",
      "/images/appartamenti/lena/lena-2.jpg",
      "/images/appartamenti/lena/lena-3.jpg",
      "/images/appartamenti/lena/lena-4.jpg",
      "/images/appartamenti/lena/lena-5.jpg",
      "/images/appartamenti/lena/lena-6.jpg",
      "/images/appartamenti/lena/lena-7.jpg",
      "/images/appartamenti/lena/lena-8.jpg",
    ],
  },
];

export function getApartment(slug: string): ApartmentEntry | null {
  return apartments.find((a) => a.slug === slug) ?? null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getAllGuideRefs(): { category: Category; slug: string }[] {
  return categories.flatMap((category) =>
    guidesByCategory[category].map(({ slug }) => ({ category, slug }))
  );
}

export function isValidGuide(category: string, slug: string): boolean {
  if (!isCategory(category)) return false;
  return guidesByCategory[category].some((g) => g.slug === slug);
}

export function getCategoryForSlug(slug: string): Category | null {
  for (const cat of categories) {
    if (guidesByCategory[cat].some((g) => g.slug === slug)) return cat;
  }
  return null;
}
