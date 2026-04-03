import type { Metadata } from "next";
import type { Locale } from "./i18n";
import type { Category } from "./guides";

export const siteUrl = "https://vacanzeallamaddalena.it";

export const siteName: Record<Locale, string> = {
  it: "Vacanze alla Maddalena",
  en: "La Maddalena Holidays",
};

const titles: Record<Locale, string> = {
  it: "Vacanze alla Maddalena — Magazine di viaggio sull'arcipelago",
  en: "La Maddalena Holidays — Archipelago travel magazine",
};

const descriptions: Record<Locale, string> = {
  it: "Venti, spiagge e tavola dell'arcipelago di La Maddalena: una lettura lenta per viaggiatori che vogliono vivere l'isola come un locale.",
  en: "Winds, beaches and harbour food on the La Maddalena archipelago: a slow read for travellers who want to experience the island like a local.",
};

const keywords: Record<Locale, string[]> = {
  it: [
    "La Maddalena",
    "arcipelago La Maddalena",
    "vacanze La Maddalena",
    "spiagge La Maddalena",
    "venti arcipelago Sardegna",
    "Caprera",
    "Porto Massimo",
    "Cala Coticcio",
    "Budelli",
    "Sardegna",
    "appartamenti La Maddalena",
  ],
  en: [
    "La Maddalena",
    "La Maddalena archipelago",
    "La Maddalena holidays",
    "La Maddalena beaches",
    "Sardinia archipelago",
    "Caprera",
    "Porto Massimo",
    "Cala Coticcio",
    "Budelli",
    "Sardinia",
    "La Maddalena apartments",
  ],
};

export function siteMetadata(locale: Locale): Metadata {
  const title = titles[locale];
  const description = descriptions[locale];
  const name = siteName[locale];

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s · ${name}`,
    },
    description,
    keywords: keywords[locale],
    authors: [{ name }],
    openGraph: {
      type: "website",
      locale: locale === "it" ? "it_IT" : "en_GB",
      url: `${siteUrl}/${locale}`,
      siteName: name,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        it: `${siteUrl}/it`,
        en: `${siteUrl}/en`,
        "x-default": `${siteUrl}/it`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

// ─── Guide metadata ───────────────────────────────────────────────────────────

type GuideMeta = { title: string; description: string; keywords: string[] };

const guidesMeta: Record<Locale, Record<string, GuideMeta>> = {
  it: {
    // ISOLE
    "la-maddalena": {
      title: "Isola di La Maddalena — guida alla capitale dell'arcipelago",
      description:
        "Dal porto di Cala Gavetta al faro di Guardia Vecchia, passando per il Passo della Moneta: La Maddalena come base operativa per esplorare l'intero arcipelago.",
      keywords: [
        "La Maddalena isola",
        "Cala Gavetta La Maddalena",
        "Guardia Vecchia La Maddalena",
        "Passo della Moneta",
        "spiagge La Maddalena",
        "porto La Maddalena",
        "borgo La Maddalena",
      ],
    },
    caprera: {
      title: "Isola di Caprera — storia, sentieri e calette",
      description:
        "Compendio Garibaldino, Centro Velico di Stagnali, sentiero di Punta Rossa e Cala Coticcio: la guida completa a Caprera, l'isola che non si capisce in un giorno.",
      keywords: [
        "isola di Caprera",
        "Caprera trekking sentieri",
        "Cala Coticcio Caprera",
        "Compendio Garibaldino Caprera",
        "Stagnali Centro Velico",
        "Punta Rossa Caprera",
        "Due Mari Caprera",
      ],
    },
    "isole-minori": {
      title: "Santo Stefano, Santa Maria e Razzoli — le isole esterne dell'arcipelago",
      description:
        "Le isole minori dell'arcipelago di La Maddalena: Santo Stefano con la base NATO, il Passo degli Asinelli tra Santa Maria e Razzoli, il faro di confine.",
      keywords: [
        "isole minori arcipelago La Maddalena",
        "isola di Santo Stefano",
        "isola di Santa Maria La Maddalena",
        "isola di Razzoli",
        "Passo degli Asinelli",
        "Bocche di Bonifacio isole",
      ],
    },
    "spiagge-budelli-spargi": {
      title: "Budelli e Spargi: Spiaggia Rosa e Cala Corsara",
      description:
        "Come raggiungere Budelli (Spiaggia Rosa) e Spargi (Cala Corsara) dall'arcipelago di La Maddalena: orari, regole del Parco e consigli pratici.",
      keywords: [
        "Spiaggia Rosa Budelli",
        "Cala Corsara Spargi",
        "isola di Budelli",
        "isola di Spargi",
        "come raggiungere Budelli",
        "tour Budelli Spargi",
        "Spiaggia del Cavaliere Budelli",
        "relitto Spargi",
      ],
    },
    // ATTIVITÀ
    "diving-snorkeling": {
      title: "Diving e snorkeling a La Maddalena — Secca di Mezzo, relitto di Spargi e fondali",
      description:
        "Gorgonie rosse, cernie adulte, il relitto romano del II sec. a.C. e una visibilità di 25 metri: guida ai diving center e ai migliori siti subacquei dell'arcipelago.",
      keywords: [
        "diving La Maddalena",
        "snorkeling La Maddalena",
        "Secca di Mezzo La Maddalena",
        "relitto Spargi immersioni",
        "Area 11 Diver La Maddalena",
        "Argonauta Diving Sardinia",
        "gorgonie arcipelago",
        "permesso immersioni Parco",
      ],
    },
    vela: {
      title: "Vela a La Maddalena — Bocche di Bonifacio, Centro Velico Caprera e regate",
      description:
        "La Maddalena è la capitale italiana della vela: le Bocche di Bonifacio come scuola naturale, il Centro Velico di Stagnali e il Trofeo Leone di Caprera.",
      keywords: [
        "vela La Maddalena",
        "Centro Velico Caprera Stagnali",
        "corso vela La Maddalena",
        "Bocche di Bonifacio vela",
        "Trofeo Leone di Caprera",
        "navigare arcipelago La Maddalena",
        "patente nautica Sardegna",
      ],
    },
    trekking: {
      title: "Trekking a La Maddalena e Caprera — sentieri, Punta Rossa e Guardia Vecchia",
      description:
        "Il granito rosa, il mirto e il blu del mare: guida ai sentieri di Caprera (Monte Fico, Due Mari, Punta Rossa) e al faro di Guardia Vecchia sull'isola principale.",
      keywords: [
        "trekking La Maddalena",
        "sentieri Caprera",
        "Punta Rossa Caprera trekking",
        "Due Mari sentiero Caprera",
        "Monte Fico Caprera",
        "Guardia Vecchia La Maddalena",
        "escursioni arcipelago Sardegna",
        "guide ambientali La Maddalena",
      ],
    },
    "tour-barca": {
      title: "Tour in barca a La Maddalena — Consorzio Meraviglie, Apollo II e noleggio gommoni",
      description:
        "Tre modi di navigare l'arcipelago: i tour guidati da Cala Gavetta, il charter esclusivo su veliero d'epoca e il noleggio autonomo. Con la guida al vento per scegliere l'itinerario giusto.",
      keywords: [
        "tour barca La Maddalena",
        "Consorzio Meraviglie Arcipelago",
        "Apollo II veliero La Maddalena",
        "noleggio gommoni La Maddalena",
        "charter barca La Maddalena",
        "escursioni isole arcipelago",
        "Delfino Tours La Maddalena",
        "Budelli Spargi tour",
      ],
    },
    "kayak-sport-acquatici": {
      title: "Kayak, SUP e pescaturismo a La Maddalena — sport acquatici nell'arcipelago",
      description:
        "Esplorare le calette di Caprera in kayak al mattino presto, il SUP nelle acque piatte di Porto Massimo e il pescaturismo con i pescatori locali all'alba.",
      keywords: [
        "kayak La Maddalena",
        "SUP La Maddalena",
        "kayak Caprera",
        "Porto Massimo SUP",
        "pescaturismo La Maddalena",
        "sport acquatici arcipelago Sardegna",
        "noleggio kayak La Maddalena",
        "windsurf Spalmatore",
      ],
    },
    // GUIDA
    venti: {
      title: "I venti dell'arcipelago di La Maddalena",
      description:
        "Maestrale, Scirocco, Libeccio: dove andare e dove ripararsi sull'arcipelago di La Maddalena in base al vento del giorno.",
      keywords: [
        "venti La Maddalena",
        "Maestrale arcipelago",
        "Scirocco Sardegna",
        "Porto Massimo Maestrale",
        "Cala Coticcio Scirocco",
        "Bassa Trinità",
        "Spalmatore",
        "Caprera vento",
      ],
    },
    spiagge: {
      title: "Spiagge e calette dell'arcipelago di La Maddalena",
      description:
        "Cala Coticcio, Budelli, Cala Corsara, Bassa Trinità: una guida editoriale alle spiagge dell'arcipelago senza classifiche e senza folla.",
      keywords: [
        "spiagge La Maddalena",
        "Cala Coticcio Caprera",
        "Spiaggia Rosa Budelli",
        "Cala Corsara Spargi",
        "Bassa Trinità",
        "calette arcipelago",
        "spiagge Sardegna",
      ],
    },
    food: {
      title: "Dove mangiare a La Maddalena: tavola di porto e tradizione sarda",
      description:
        "Pesce di rete, granita, Vermentino e mercato del mattino: la guida gastronomica dell'arcipelago per chi vuole mangiare come un locale.",
      keywords: [
        "ristoranti La Maddalena",
        "dove mangiare La Maddalena",
        "pesce fresco arcipelago",
        "granita La Maddalena",
        "Vermentino Sardegna",
        "mercato La Maddalena",
        "cucina sarda",
      ],
    },
    "quando-venire": {
      title: "Quando venire a La Maddalena — guida alle stagioni dell'arcipelago",
      description:
        "Aprile cristallino, giugno perfetto, la verità su agosto e il settembre dei conoscitori: la guida onesta alle stagioni dell'arcipelago di La Maddalena.",
      keywords: [
        "quando visitare La Maddalena",
        "stagioni La Maddalena",
        "La Maddalena settembre",
        "La Maddalena giugno",
        "periodo migliore La Maddalena",
        "La Maddalena fuori stagione",
        "mesi migliori Sardegna arcipelago",
      ],
    },
    "luce-fotografia": {
      title: "Luce e fotografia a La Maddalena — guida ai luoghi e alle ore migliori",
      description:
        "Il granito diafano di Punta Tegge all'alba, i riflessi di Cala Coticcio alle dieci, il tramonto verso la Corsica da Guardia Vecchia: dove trovare la luce migliore dell'arcipelago.",
      keywords: [
        "fotografia La Maddalena",
        "Punta Tegge alba fotografia",
        "Cala Coticcio luce",
        "Guardia Vecchia tramonto",
        "granito rosa La Maddalena fotografia",
        "fotografia paesaggio Sardegna",
        "luce arcipelago La Maddalena",
      ],
    },
    // UTILITIES
    "parco-nazionale": {
      title: "Parco Nazionale Arcipelago di La Maddalena: permessi e zonizzazione",
      description:
        "18.000 ettari, 180 km di coste, Santuario Pelagos: tutto ciò che serve sapere sul Parco Nazionale di La Maddalena prima di partire.",
      keywords: [
        "Parco Nazionale La Maddalena",
        "permessi Parco La Maddalena",
        "zonizzazione arcipelago",
        "Santuario Pelagos",
        "diporto Parco La Maddalena",
        "immersioni Parco La Maddalena",
        "Bocche di Bonifacio",
      ],
    },
    ecologia: {
      title: "Turismo consapevole a La Maddalena: ecologia e buona condotta",
      description:
        "Codice di Buona Condotta, arcipelago senza plastica, Posidonia e fauna marina protetta: come visitare il Parco rispettando il territorio.",
      keywords: [
        "turismo consapevole La Maddalena",
        "ecologia arcipelago",
        "Posidonia La Maddalena",
        "Parco senza plastica Sardegna",
        "Codice Buona Condotta Parco",
        "fauna marina protetta arcipelago",
        "SEAME Sardinia",
      ],
    },
    "vivere-il-borgo": {
      title: "Vivere La Maddalena: guida pratica al borgo",
      description:
        "Traghetti, bus, mercato, farmacie, numeri utili e vita quotidiana a La Maddalena: la guida pratica per chi soggiorna nell'arcipelago.",
      keywords: [
        "come arrivare La Maddalena",
        "traghetto Palau La Maddalena",
        "servizi La Maddalena",
        "mercato La Maddalena",
        "vivere La Maddalena",
        "numeri utili La Maddalena",
        "Delcomar Blu Navy",
      ],
    },
    "come-arrivare": {
      title: "Come arrivare a La Maddalena — traghetto da Palau, Delcomar e Blu Navy",
      description:
        "Come prendere il traghetto da Palau a La Maddalena: differenze tra Delcomar e Blu Navy, come prenotare online in agosto, come muoversi sull'isola con scooter o bici elettrica.",
      keywords: [
        "come arrivare La Maddalena",
        "traghetto Palau La Maddalena",
        "Delcomar La Maddalena",
        "Blu Navy La Maddalena",
        "noleggio scooter La Maddalena",
        "noleggio bici elettrica La Maddalena",
        "come muoversi La Maddalena",
        "traghetto Sardegna isole",
      ],
    },
    servizi: {
      title: "Servizi a La Maddalena — supermercati, farmacie, bancomat e ospedale",
      description:
        "Dove si trovano i supermercati, le farmacie di turno, i bancomat e l'ospedale Paolo Merlo a La Maddalena: la guida pratica per chi soggiorna in appartamento.",
      keywords: [
        "servizi La Maddalena",
        "supermercati La Maddalena",
        "farmacia La Maddalena",
        "ospedale Paolo Merlo La Maddalena",
        "bancomat La Maddalena",
        "WiFi La Maddalena",
        "cosa sapere La Maddalena vacanze",
      ],
    },
  },
  en: {
    // ISOLE
    "la-maddalena": {
      title: "La Maddalena Island — guide to the archipelago capital",
      description:
        "From Cala Gavetta harbour to the Guardia Vecchia lighthouse, through the Passo della Moneta: La Maddalena as the operational base for exploring the whole archipelago.",
      keywords: [
        "La Maddalena island",
        "Cala Gavetta La Maddalena",
        "Guardia Vecchia La Maddalena",
        "Passo della Moneta",
        "La Maddalena beaches",
        "La Maddalena harbour",
        "La Maddalena village",
      ],
    },
    caprera: {
      title: "Caprera Island — history, trails and coves",
      description:
        "Garibaldi Compendium, Stagnali sailing centre, Punta Rossa trail and Cala Coticcio: the complete guide to Caprera, the island you can't understand in a day.",
      keywords: [
        "Caprera island",
        "Caprera trekking trails",
        "Cala Coticcio Caprera",
        "Garibaldi Compendium Caprera",
        "Stagnali sailing school",
        "Punta Rossa Caprera",
        "Due Mari Caprera",
      ],
    },
    "isole-minori": {
      title: "Santo Stefano, Santa Maria and Razzoli — the outer islands",
      description:
        "The outer islands of the La Maddalena archipelago: Santo Stefano with the NATO base, the Passo degli Asinelli between Santa Maria and Razzoli, the border lighthouse.",
      keywords: [
        "outer islands La Maddalena archipelago",
        "Santo Stefano island",
        "Santa Maria island La Maddalena",
        "Razzoli island",
        "Passo degli Asinelli",
        "Bocche di Bonifacio islands",
      ],
    },
    "spiagge-budelli-spargi": {
      title: "Budelli and Spargi: Spiaggia Rosa and Cala Corsara",
      description:
        "How to reach Budelli (Spiaggia Rosa) and Spargi (Cala Corsara) from the La Maddalena archipelago: timing, Park rules and practical advice.",
      keywords: [
        "Spiaggia Rosa Budelli",
        "Cala Corsara Spargi",
        "Budelli island",
        "Spargi island",
        "how to reach Budelli",
        "Budelli Spargi tour",
        "Spiaggia del Cavaliere Budelli",
        "Spargi wreck",
      ],
    },
    // ACTIVITIES
    "diving-snorkeling": {
      title: "Diving and snorkelling in La Maddalena — Secca di Mezzo and Spargi wreck",
      description:
        "Red sea fans, adult groupers, a Roman wreck from the 2nd century BC and 25-metre visibility: guide to dive centres and top dive sites in the archipelago.",
      keywords: [
        "diving La Maddalena",
        "snorkelling La Maddalena",
        "Secca di Mezzo dive site",
        "Spargi Roman wreck",
        "Area 11 Diver La Maddalena",
        "Argonauta Diving Sardinia",
        "sea fans Mediterranean",
        "Park dive permit Sardinia",
      ],
    },
    vela: {
      title: "Sailing La Maddalena — Bocche di Bonifacio, Centro Velico Caprera",
      description:
        "La Maddalena is Italy's sailing capital: the Bocche di Bonifacio as a natural school, Stagnali's sailing centre and the Leone di Caprera regatta.",
      keywords: [
        "sailing La Maddalena",
        "Centro Velico Caprera Stagnali",
        "sailing course La Maddalena",
        "Bocche di Bonifacio sailing",
        "Trofeo Leone di Caprera",
        "sailing archipelago La Maddalena",
        "sailing licence Sardinia",
      ],
    },
    trekking: {
      title: "Trekking La Maddalena and Caprera — trails, Punta Rossa, Guardia Vecchia",
      description:
        "Pink granite, myrtle and the blue sea: guide to Caprera trails (Monte Fico, Due Mari, Punta Rossa) and Guardia Vecchia lighthouse on the main island.",
      keywords: [
        "trekking La Maddalena",
        "Caprera trails",
        "Punta Rossa Caprera trekking",
        "Due Mari trail Caprera",
        "Monte Fico Caprera",
        "Guardia Vecchia La Maddalena",
        "hiking La Maddalena archipelago",
        "environmental guides La Maddalena",
      ],
    },
    "tour-barca": {
      title: "Boat tours in La Maddalena — Consorzio Meraviglie, Apollo II and gommone hire",
      description:
        "Three ways to navigate the archipelago: guided tours from Cala Gavetta, exclusive charter on a vintage schooner and self-hire. With a wind guide to picking the right itinerary.",
      keywords: [
        "boat tours La Maddalena",
        "Consorzio Meraviglie Arcipelago",
        "Apollo II schooner La Maddalena",
        "gommone hire La Maddalena",
        "private charter La Maddalena",
        "island excursions archipelago",
        "Delfino Tours La Maddalena",
        "Budelli Spargi boat tour",
      ],
    },
    "kayak-sport-acquatici": {
      title: "Kayak, SUP and water sports in La Maddalena — archipelago activities",
      description:
        "Exploring Caprera coves by kayak at first light, SUP on the flat water of Porto Massimo and pescaturismo with local fishermen before dawn.",
      keywords: [
        "kayak La Maddalena",
        "SUP La Maddalena",
        "kayak Caprera",
        "Porto Massimo SUP",
        "pescaturismo La Maddalena",
        "water sports La Maddalena archipelago",
        "kayak hire La Maddalena",
        "windsurfing Spalmatore",
      ],
    },
    // INSIDER GUIDE
    venti: {
      title: "Winds of the La Maddalena Archipelago",
      description:
        "Mistral, Scirocco, Libeccio: where to go and where to shelter on the La Maddalena archipelago depending on the day's wind.",
      keywords: [
        "La Maddalena winds",
        "Mistral archipelago",
        "Scirocco Sardinia",
        "Porto Massimo Mistral",
        "Cala Coticcio Scirocco",
        "Bassa Trinità",
        "Spalmatore",
        "Caprera wind",
      ],
    },
    spiagge: {
      title: "Beaches and coves of the La Maddalena Archipelago",
      description:
        "Cala Coticcio, Budelli, Cala Corsara, Bassa Trinità: an editorial guide to the archipelago's beaches — no rankings, no crowds.",
      keywords: [
        "La Maddalena beaches",
        "Cala Coticcio Caprera",
        "Pink Beach Budelli",
        "Cala Corsara Spargi",
        "Bassa Trinità",
        "Sardinia archipelago beaches",
      ],
    },
    food: {
      title: "Where to eat in La Maddalena: harbour food and Sardinian tradition",
      description:
        "Net fish, granite ice, Vermentino and the morning market: a gastronomic guide to the archipelago for those who want to eat like a local.",
      keywords: [
        "restaurants La Maddalena",
        "where to eat La Maddalena",
        "fresh fish archipelago",
        "granite ice La Maddalena",
        "Vermentino Sardinia",
        "La Maddalena market",
        "Sardinian cuisine",
      ],
    },
    "quando-venire": {
      title: "When to visit La Maddalena — seasonal guide to the archipelago",
      description:
        "Crystalline April, perfect June, the truth about August and the insiders' September: the honest seasonal guide to the La Maddalena archipelago.",
      keywords: [
        "when to visit La Maddalena",
        "La Maddalena seasons",
        "La Maddalena September",
        "La Maddalena June",
        "best time La Maddalena",
        "La Maddalena off season",
        "best months Sardinia archipelago",
      ],
    },
    "luce-fotografia": {
      title: "Light and photography in La Maddalena — a guide to the best spots and hours",
      description:
        "The diaphanous granite of Punta Tegge at dawn, the reflections of Cala Coticcio at ten, the sunset towards Corsica from Guardia Vecchia: where to find the archipelago's finest light.",
      keywords: [
        "photography La Maddalena",
        "Punta Tegge sunrise photography",
        "Cala Coticcio light",
        "Guardia Vecchia sunset",
        "pink granite La Maddalena photography",
        "landscape photography Sardinia",
        "light La Maddalena archipelago",
      ],
    },
    // UTILITIES
    "parco-nazionale": {
      title: "La Maddalena National Park: permits and zoning",
      description:
        "18,000 hectares, 180 km of coastline, Pelagos Sanctuary: everything you need to know about the La Maddalena National Park before you travel.",
      keywords: [
        "La Maddalena National Park",
        "La Maddalena Park permits",
        "archipelago zoning",
        "Pelagos Sanctuary",
        "boating permit La Maddalena",
        "diving permit La Maddalena",
        "Bocche di Bonifacio",
      ],
    },
    ecologia: {
      title: "Responsible tourism in La Maddalena: ecology and good conduct",
      description:
        "Code of Good Conduct, plastic-free archipelago, Posidonia and protected marine life: how to visit the Park with respect for the territory.",
      keywords: [
        "responsible tourism La Maddalena",
        "archipelago ecology",
        "Posidonia La Maddalena",
        "plastic-free Sardinia Park",
        "Code of Conduct La Maddalena",
        "protected marine life archipelago",
        "SEAME Sardinia",
      ],
    },
    "vivere-il-borgo": {
      title: "Living La Maddalena: practical guide to the village",
      description:
        "Ferries, buses, market, pharmacies, useful numbers and daily life in La Maddalena: the practical guide for those staying in the archipelago.",
      keywords: [
        "how to get to La Maddalena",
        "ferry Palau La Maddalena",
        "La Maddalena services",
        "La Maddalena market",
        "living La Maddalena",
        "useful numbers La Maddalena",
        "Delcomar Blu Navy",
      ],
    },
    "come-arrivare": {
      title: "Getting to La Maddalena — ferry from Palau, Delcomar and Blu Navy",
      description:
        "How to take the ferry from Palau to La Maddalena: differences between Delcomar and Blu Navy, how to book online in August, and how to get around by scooter or e-bike.",
      keywords: [
        "how to get to La Maddalena",
        "ferry Palau La Maddalena",
        "Delcomar La Maddalena ferry",
        "Blu Navy La Maddalena ferry",
        "scooter hire La Maddalena",
        "e-bike hire La Maddalena",
        "getting around La Maddalena",
        "Sardinia island ferry",
      ],
    },
    servizi: {
      title: "Services in La Maddalena — supermarkets, pharmacies, ATMs and hospital",
      description:
        "Where to find supermarkets, duty pharmacies, ATMs and the Paolo Merlo hospital in La Maddalena: the practical guide for self-catering stays.",
      keywords: [
        "La Maddalena services",
        "supermarkets La Maddalena",
        "pharmacy La Maddalena",
        "Paolo Merlo hospital La Maddalena",
        "ATM La Maddalena",
        "WiFi La Maddalena",
        "self-catering La Maddalena holiday",
      ],
    },
  },
};

export function guideMetadata(
  locale: Locale,
  category: Category,
  slug: string
): Metadata {
  const meta = guidesMeta[locale][slug];
  if (!meta) return {};
  const name = siteName[locale];
  const canonical = `${siteUrl}/${locale}/${category}/${slug}`;

  return {
    metadataBase: new URL(siteUrl),
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    authors: [{ name }],
    openGraph: {
      type: "article",
      locale: locale === "it" ? "it_IT" : "en_GB",
      url: canonical,
      siteName: name,
      title: meta.title,
      description: meta.description,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
    alternates: {
      canonical,
      languages: {
        it: `${siteUrl}/it/${category}/${slug}`,
        en: `${siteUrl}/en/${category}/${slug}`,
        "x-default": `${siteUrl}/it/${category}/${slug}`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
