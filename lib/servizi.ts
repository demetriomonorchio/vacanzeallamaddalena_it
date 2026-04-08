// Client-safe — no Node.js imports.
import { serviziMercati } from "./serviziMercati";
import { serviziMusei } from "./serviziMusei";
import { serviziSpiagge } from "./serviziSpiagge";
import { serviziBanche } from "./serviziBanche";
import { serviziFarmacie } from "./serviziFarmacie";
import { serviziSupermercati } from "./serviziSupermercati";
import { serviziEmergenze } from "./serviziEmergenze";
import { serviziTrasporti } from "./serviziTrasporti";

export const zone = [
  "Centro Storico",
  "Cala Gavetta",
  "Padule",
  "Pueblo / Due Strade",
  "Moneta",
  "Caprera",
] as const;

export type Zona = (typeof zone)[number];

export const categorieServizi = [
  "Supermercati",
  "Farmacie",
  "Spiagge",
  "Gelaterie",
  "Noleggio gommoni",
  "Noleggio scooter e bike",
  "Banche & ATM",
  "Mercato",
  "Trasporti",
  "Emergenze",
  "Musei",
] as const;

export type CategoriaServizio = (typeof categorieServizi)[number];

export type Servizio = {
  name: string;
  category: CategoriaServizio;
  zona: Zona;
  /** Google Maps short or full URL */
  url?: string;
  /** Optional public rating shown in card (e.g. 4.4). */
  rating?: number;
  /** Optional number of reviews paired with rating. */
  reviews?: number;
  /** Short teaser (used e.g. for Spiagge cards). */
  description?: string;
  /** Card thumbnail: `/images/...` under `public` or `https://` URL. */
  image?: string;
};

export const servizi: readonly Servizio[] = [
  // ─── Supermercati ────────────────────────────────────────────────────────────
  ...serviziSupermercati,

  // ─── Mercato ─────────────────────────────────────────────────────────────────
  ...serviziMercati,

  // ─── Farmacie ────────────────────────────────────────────────────────────────
  ...serviziFarmacie,

  // ─── Spiagge ────────────────────────────────────────────────────────────────
  ...serviziSpiagge,

  // ─── Gelaterie ───────────────────────────────────────────────────────────────
  {
    name: "Gelateria La Finestrella",
    category: "Gelaterie",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Gelateria+La+Finestrella,+Via+Amendola+11,+La+Maddalena",
    rating: 4.8,
    reviews: 1294,
  },
  {
    name: "Gelatissimo",
    category: "Gelaterie",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Gelatissimo,+Via+Amendola+45,+La+Maddalena",
    rating: 4.7,
    reviews: 659,
  },
  {
    name: "Dolci Distrazioni — Via Amendola",
    category: "Gelaterie",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Dolci+Distrazioni,+Via+Giorgio+Amendola+35,+La+Maddalena",
    rating: 4.7,
    reviews: 59,
  },
  {
    name: "Gelateria Ilva",
    category: "Gelaterie",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Gelateria+Ilva,+Piazza+Umberto+I+1,+La+Maddalena",
    rating: 4.0,
    reviews: 118,
  },
  {
    name: "Gelateria Gelatomania",
    category: "Gelaterie",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Gelateria+Gelatomania,+Via+Giuseppe+Garibaldi+82,+La+Maddalena",
    rating: 2.6,
    reviews: 37,
  },
  {
    name: "Crema&Cioccolato",
    category: "Gelaterie",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Crema%26Cioccolato,+Via+XX+Settembre,+La+Maddalena",
    rating: 3.0,
    reviews: 42,
  },
  {
    name: "YO ciok",
    category: "Gelaterie",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=YO+ciok,+Via+Giuseppe+Garibaldi,+La+Maddalena",
    rating: 3.0,
    reviews: 58,
  },
  {
    name: "Dolci Distrazioni — Largo Matteotti (chiuso temporaneamente)",
    category: "Gelaterie",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Dolci+Distrazioni,+Largo+Giacomo+Matteotti+8,+La+Maddalena",
    rating: 4.7,
    reviews: 831,
  },

  // ─── Noleggio gommoni (solo sedi a La Maddalena; esclusi Palau, Caprera, ecc.) ─
  {
    name: "AQUA SPEED Noleggio Gommoni",
    category: "Noleggio gommoni",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=AQUA+SPEED+Noleggio+Gommoni,+Via+Amendola,+La+Maddalena",
    rating: 4.4,
    reviews: 33,
  },
  {
    name: "Bi.Pe.De.",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=Bi.Pe.De.,+Via+Padule,+La+Maddalena",
    rating: 3.8,
    reviews: 12,
  },
  {
    name: "Blue Dolphin Escursioni La Maddalena",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=Blue+Dolphin+Escursioni,+Via+Padule,+La+Maddalena",
    rating: 4.9,
    reviews: 70,
  },
  {
    name: "Boat Service",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=Boat+Service,+Localit%C3%A0+la+Ricciolina,+La+Maddalena",
    rating: 5.0,
    reviews: 5,
  },
  {
    name: "CILIEGIO 2 — Escursioni in barca La Maddalena",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=CILIEGIO+2+Escursioni,+Via+Padule+60,+La+Maddalena",
    rating: 5.0,
    reviews: 80,
  },
  {
    name: "Ecomar — Affitto posti barca",
    category: "Noleggio gommoni",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Ecomar+Affitto+Posti+Barca,+Via+Regina+Margherita+11,+La+Maddalena",
    rating: 4.5,
    reviews: 20,
  },
  {
    name: "Ecomar Noleggio Gommoni La Maddalena",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=Ecomar+Noleggio+Gommoni,+Regione+Nido+d%27Aquila+10,+La+Maddalena",
    rating: 4.7,
    reviews: 32,
  },
  {
    name: "Elena Tour Navigazioni — Escursioni e noleggio",
    category: "Noleggio gommoni",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Elena+Tour+Navigazioni,+Via+Amendola,+La+Maddalena",
    rating: 4.6,
    reviews: 944,
  },
  {
    name: "Emerald Freedom La Maddalena",
    category: "Noleggio gommoni",
    zona: "Moneta",
    url: "https://maps.google.com/?q=Emerald+Freedom+La+Maddalena,+Via+Cala+Chiesa+52,+La+Maddalena",
    rating: 5.0,
    reviews: 300,
  },
  {
    name: "ENAVIGOSARDINIA — Gite alle isole",
    category: "Noleggio gommoni",
    zona: "Cala Gavetta",
    url: "https://maps.google.com/?q=ENAVIGOSARDINIA,+Via+Lungomare+A.+Doria+7B,+La+Maddalena",
    rating: 4.9,
    reviews: 114,
  },
  {
    name: "Enjoy La Maddalena Noleggio Gommoni",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=Enjoy+La+Maddalena+Noleggio+Gommoni,+Via+Padule,+La+Maddalena",
    rating: 4.8,
    reviews: 72,
  },
  {
    name: "Exclusive Boats — La Maddalena boat rental",
    category: "Noleggio gommoni",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Exclusive+Boats+La+Maddalena,+Via+Amendola,+La+Maddalena",
    rating: 4.9,
    reviews: 42,
  },
  {
    name: "F.R. Nautica — Noleggio gommoni senza patente",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=F.R.+Nautica+Noleggio+Gommoni,+Via+Padule,+La+Maddalena",
    rating: 5.0,
    reviews: 44,
  },
  {
    name: "Freemind Experience — Escursioni e noleggio gommoni",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=Freemind+Experience,+Via+Padule,+La+Maddalena",
    rating: 5.0,
    reviews: 414,
  },
  {
    name: "Gipsy Motor Boat — La Maddalena Excursions",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=Gipsy+Motor+Boat,+Via+Padule,+La+Maddalena",
    rating: 5.0,
    reviews: 79,
  },
  {
    name: "Grace boat — Escursioni e noleggio La Maddalena",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=Grace+boat+Escursioni,+Via+Padule,+La+Maddalena",
    rating: 5.0,
    reviews: 29,
  },
  {
    name: "Il Porticciolo — Noleggio gommoni e posti barca",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=Il+Porticciolo+Noleggio+Gommoni,+Via+Padule,+La+Maddalena",
    rating: 4.8,
    reviews: 52,
  },
  {
    name: "Island Marine La Maddalena — noleggio gommone con skipper",
    category: "Noleggio gommoni",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Island+Marine+La+Maddalena,+Via+Eleonora+D%27Arborea+3,+La+Maddalena",
    rating: 5.0,
    reviews: 1,
  },
  {
    name: "La Maddalena in gommone (F.M. Service)",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=La+Maddalena+in+gommone+F.M.+Service,+Via+Padule,+La+Maddalena",
    rating: 5.0,
    reviews: 88,
  },
  {
    name: "Marina Dei Giardinelli La Maddalena",
    category: "Noleggio gommoni",
    zona: "Moneta",
    url: "https://maps.google.com/?q=Marina+Dei+Giardinelli,+Localit%C3%A0+Giardinelli,+La+Maddalena",
    rating: 4.5,
    reviews: 19,
  },
  {
    name: "Marina Del Ponte",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=Marina+Del+Ponte,+Via+Benvenuto+Cellini,+La+Maddalena",
    rating: 4.4,
    reviews: 106,
  },
  {
    name: "Marinella IV — Escursioni in barca",
    category: "Noleggio gommoni",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Marinella+IV,+Via+Amendola+10,+La+Maddalena",
    rating: 4.9,
    reviews: 102,
  },
  {
    name: "Mas Que Nada — noleggio gommoni",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=Mas+Que+Nada+noleggio+gommoni,+La+Maddalena",
    rating: 5.0,
    reviews: 16,
  },
  {
    name: "MD Service Nautica — Noleggio gommoni",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=MD+Service+Nautica+Noleggio+Gommoni,+Via+Ulisse,+La+Maddalena",
    rating: 4.6,
    reviews: 173,
  },
  {
    name: "Memo — Escursioni e gite in gommone",
    category: "Noleggio gommoni",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Memo+escursioni+gite+gommone,+Piazza+Villamarina+4,+La+Maddalena",
    rating: 4.8,
    reviews: 20,
  },
  {
    name: "Motoscafo Free Whale — Noleggio barche La Maddalena",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=Motoscafo+Free+Whale,+Via+Padule+7,+La+Maddalena",
    rating: 4.3,
    reviews: 6,
  },
  {
    name: "Noleggio gommoni con e senza conducente — rent zodiac",
    category: "Noleggio gommoni",
    zona: "Cala Gavetta",
    url: "https://maps.google.com/?q=Noleggio+gommoni+rent+zodiac,+banchina+Punta+Chiara,+La+Maddalena",
    rating: 1.8,
    reviews: 5,
  },
  {
    name: "Noleggio gommoni con e senza conducente — Sea Escape",
    category: "Noleggio gommoni",
    zona: "Moneta",
    url: "https://maps.google.com/?q=Sea+Escape+noleggio+gommoni,+Loc.+Cala+Peticchia,+La+Maddalena",
    rating: 4.9,
    reviews: 26,
  },
  {
    name: "Noleggio gommoni Fratelli Cuccu",
    category: "Noleggio gommoni",
    zona: "Cala Gavetta",
    url: "https://maps.google.com/?q=Noleggio+gommoni+Fratelli+Cuccu,+Banchina+Poste,+La+Maddalena",
    rating: 4.1,
    reviews: 29,
  },
  {
    name: "Noleggio gommoni La Maddalena — Antares Rentals",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=Antares+Rentals+noleggio+gommoni,+Via+Benvenuto+Cellini,+La+Maddalena",
    rating: 5.0,
    reviews: 4,
  },
  {
    name: "Noleggio Gommoni — Nautica Sagiel",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=Nautica+Sagiel+Noleggio+Gommoni,+Via+Ulisse,+La+Maddalena",
    rating: 5.0,
    reviews: 183,
  },
  {
    name: "Noleggio Gommoni e affitto posti barca — Ecomar (Punta Chiara)",
    category: "Noleggio gommoni",
    zona: "Cala Gavetta",
    url: "https://maps.google.com/?q=Ecomar+Noleggio+Gommoni,+banchina+Punta+Chiara,+La+Maddalena",
    rating: 4.8,
    reviews: 53,
  },
  {
    name: "Noleggio Gommoni Karma",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=Noleggio+Gommoni+Karma,+Via+Padule,+La+Maddalena",
    rating: 5.0,
    reviews: 352,
  },
  {
    name: "Noleggio Gommoni La Maddalena — Eagle Marine",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=Eagle+Marine+Noleggio+Gommoni,+Regione+Nido+d%27Aquila,+La+Maddalena",
    rating: 4.9,
    reviews: 92,
  },
  {
    name: "Noleggio Gommoni La Maddalena — H2Omarine",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=H2Omarine+Noleggio+Gommoni,+Via+Padule,+La+Maddalena",
    rating: 5.0,
    reviews: 165,
  },
  {
    name: "Noleggio Gommoni La Maddalena — On Board",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=On+Board+Noleggio+Gommoni,+Via+Padule,+La+Maddalena",
    rating: 4.6,
    reviews: 78,
  },
  {
    name: "Noleggio Gommoni Lo Squalo Bianco",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=Lo+Squalo+Bianco+Noleggio+Gommoni,+Via+Ulisse+1,+La+Maddalena",
    rating: 4.9,
    reviews: 500,
  },
  {
    name: "Noleggio Gommoni Passion Marine La Maddalena",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=Passion+Marine+Noleggio+Gommoni,+Regione+Nido+d%27Aquila,+La+Maddalena",
    rating: 5.0,
    reviews: 37,
  },
  {
    name: "Nautilus Noleggio Gommoni — Anna Rosa Loi",
    category: "Noleggio gommoni",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Nautilus+Noleggio+Gommoni,+Piazza+Umberto+I,+La+Maddalena",
    rating: 4.4,
    reviews: 48,
  },
  {
    name: "Paquito Escursioni",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=Paquito+Escursioni,+Via+Stefano+Palmas,+La+Maddalena",
    rating: 5.0,
    reviews: 7,
  },
  {
    name: "Porto Cala Mangiavolpe",
    category: "Noleggio gommoni",
    zona: "Cala Gavetta",
    url: "https://maps.google.com/?q=Porto+Cala+Mangiavolpe,+Lungomare+Via+Amendola,+La+Maddalena",
    rating: 4.5,
    reviews: 905,
  },
  {
    name: "Posti barca Cala Mangiavolpe",
    category: "Noleggio gommoni",
    zona: "Cala Gavetta",
    url: "https://maps.google.com/?q=Posti+Barca+Cala+Mangiavolpe,+Lungomare+Via+Amendola,+La+Maddalena",
    rating: 5.0,
    reviews: 5,
  },
  {
    name: "Sardegna Yacht Charter Tour La Maddalena",
    category: "Noleggio gommoni",
    zona: "Cala Gavetta",
    url: "https://maps.google.com/?q=Sardegna+Yacht+Charter+Tour,+Via+Lungomare+A.+Doria+39,+La+Maddalena",
    rating: 5.0,
    reviews: 4,
  },
  {
    name: "Sardinia Sea Excursions — La Maddalena boat trips",
    category: "Noleggio gommoni",
    zona: "Cala Gavetta",
    url: "https://maps.google.com/?q=Sardinia+Sea+Excursions,+Cala+Gavetta,+La+Maddalena",
    rating: 4.9,
    reviews: 98,
  },
  {
    name: "Timi Boat — Rent Yacht",
    category: "Noleggio gommoni",
    zona: "Padule",
    url: "https://maps.google.com/?q=Timi+Boat+Rent+Yacht,+Via+Balilla+11,+La+Maddalena",
    rating: 3.7,
    reviews: 3,
  },
  {
    name: "Vale Boat e Travel — Gite in barca",
    category: "Noleggio gommoni",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Vale+Boat+e+Travel,+Via+Amendola+87,+La+Maddalena",
    rating: 5.0,
    reviews: 36,
  },
  {
    name: "Veliero Dolce Vita La Maddalena",
    category: "Noleggio gommoni",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Veliero+Dolce+Vita,+Via+Indipendenza+1,+La+Maddalena",
    rating: 4.9,
    reviews: 172,
  },

  // ─── Noleggio scooter e bike ─────────────────────────────────────────────────
  {
    name: "Rent Experience — Slow Travel (e-bike, scooter, kayak) — chiuso temporaneamente",
    category: "Noleggio scooter e bike",
    zona: "Cala Gavetta",
    url: "https://maps.google.com/?q=Rent+Experience+Slow+Travel+La+Maddalena,+porto+La+Maddalena",
    rating: 4.9,
    reviews: 74,
  },
  {
    name: "Mega Motors — Moto, bike, MTB, e-bike e quad",
    category: "Noleggio scooter e bike",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Mega+Motors+Noleggio,+Via+Amendola+2,+La+Maddalena",
    rating: 4.8,
    reviews: 131,
  },
  {
    name: "189 Garage — Noleggio scooter",
    category: "Noleggio scooter e bike",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=189+Garage+noleggio+scooter,+Via+Amendola+17,+La+Maddalena",
    rating: 4.3,
    reviews: 213,
  },
  {
    name: "Noleggio Rondinella La Maddalena",
    category: "Noleggio scooter e bike",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Noleggio+Rondinella,+Via+Amendola+41,+La+Maddalena",
    rating: 4.5,
    reviews: 25,
  },
  {
    name: "Noleggio F.lli Cuccu — Auto, scooter, quad, gommoni, e-bike",
    category: "Noleggio scooter e bike",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Noleggio+Flli+Cuccu,+Via+Amendola+45,+La+Maddalena",
    rating: 4.6,
    reviews: 389,
  },
  {
    name: "Nicolsport",
    category: "Noleggio scooter e bike",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Nicolsport,+Via+Amendola+16,+La+Maddalena",
    rating: 3.5,
    reviews: 226,
  },

  // ─── Banche & ATM ────────────────────────────────────────────────────────────
  ...serviziBanche,

  // ─── Trasporti ───────────────────────────────────────────────────────────────
  ...serviziTrasporti,

  // ─── Emergenze ───────────────────────────────────────────────────────────────
  ...serviziEmergenze,

  // ─── Musei (solo arcipelago: La Maddalena e Caprera) ─────────────────────────
  ...serviziMusei,
];
