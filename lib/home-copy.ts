import type { Locale } from "./i18n";

export type HomeCopy = {
  hero: { kicker: string; title: string; subtitle: string; imageAlt: string };
  insider: { title: string; intro: string };
  guides: { slug: string; title: string; excerpt: string }[];
  stay: { title: string; intro: string };
  stays: { name: string; tagline: string; href: string }[];
  cta: { guide: string; partner: string };
};

const copy: Record<Locale, HomeCopy> = {
  it: {
    hero: {
      kicker: "Arcipelago de La Maddalena · Sardegna",
      title: "Sette isole. Un tempo diverso.",
      subtitle:
        "Il vento qui non è rumore di fondo: è un'indicazione. Impara a leggerlo e troverai le calette che i turisti non raggiungono mai.",
      imageAlt:
        "Granito rosa e mare trasparente dell'arcipelago di La Maddalena, Sardegna",
    },
    insider: {
      title: "Field Notes",
      intro:
        "Tre letture per chi vuole vivere l'arcipelago come un habitué: venti, spiagge e tavola senza filtri da guida turistica.",
    },
    guides: [
      {
        slug: "venti",
        title: "I venti dell'arcipelago",
        excerpt:
          "Con il Maestrale il versante ovest diventa cristallo. Con lo Scirocco, si gira a Caprera. Una mappa meteorologica per orientarsi davvero.",
      },
      {
        slug: "spiagge",
        title: "Spiagge e silenzio",
        excerpt:
          "Le calette che non appaiono sulle riviste, la luce del primo mattino, il granito rosa come sfondo sempre diverso.",
      },
      {
        slug: "food",
        title: "Tavola di porto",
        excerpt:
          "Pesce di rete, vino sardo, granite come rito. Una mappa gastronomica senza stelle né algoritmi.",
      },
    ],
    stay: {
      title: "Dove dormire",
      intro:
        "Tre appartamenti con carattere sull'isola. Basi operative per esplorare, non semplici camere.",
    },
    cta: { guide: "Apri la guida", partner: "Scopri su vacanzemaddalena.com" },
    stays: [
      {
        name: "Isola",
        tagline:
          "Tra calette e silenzio — la base giusta per chi vuole l'arcipelago tutto per sé.",
        href: "https://vacanzemaddalena.com",
      },
      {
        name: "Madda",
        tagline:
          "Al centro del borgo, a pochi minuti dal porto e dal mercato del mattino.",
        href: "https://vacanzemaddalena.com",
      },
      {
        name: "Lena",
        tagline: "Luminosa, essenziale. Con la vista che dice tutto il resto.",
        href: "https://vacanzemaddalena.com",
      },
    ],
  },

  en: {
    hero: {
      kicker: "La Maddalena Archipelago · Sardinia",
      title: "Seven islands. One different time.",
      subtitle:
        "The wind here is not background noise — it is a compass. Learn to read it and you'll find coves the crowds never reach.",
      imageAlt:
        "Pink granite and clear water of the La Maddalena archipelago, Sardinia",
    },
    insider: {
      title: "Field Notes",
      intro:
        "Three reads for those who want to live the archipelago like a regular — winds, beaches and food without the tourist filter.",
    },
    guides: [
      {
        slug: "venti",
        title: "Archipelago winds",
        excerpt:
          "Mistral turns the western shore to crystal. Scirocco sends you to Caprera. A meteorological map for real orientation.",
      },
      {
        slug: "spiagge",
        title: "Beaches and silence",
        excerpt:
          "Coves that never make the magazines, early-morning light, pink granite as an ever-changing backdrop.",
      },
      {
        slug: "food",
        title: "Harbour table",
        excerpt:
          "Net fish, Sardinian wine, granite ices as ritual. A gastronomic map without stars or algorithms.",
      },
    ],
    stay: {
      title: "Where to stay",
      intro:
        "Three characterful apartments on the island. Bases for exploration, not just rooms.",
    },
    cta: { guide: "Open the guide", partner: "Discover vacanzemaddalena.com" },
    stays: [
      {
        name: "Isola",
        tagline:
          "Between coves and quiet — the right base for those who want the archipelago to themselves.",
        href: "https://vacanzemaddalena.com",
      },
      {
        name: "Madda",
        tagline:
          "In the village centre, minutes from the port and the morning market.",
        href: "https://vacanzemaddalena.com",
      },
      {
        name: "Lena",
        tagline: "Light-filled, essential. With a view that says the rest.",
        href: "https://vacanzemaddalena.com",
      },
    ],
  },
};

export function getHomeCopy(locale: Locale): HomeCopy {
  return copy[locale];
}
