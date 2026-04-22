// Client-safe — no Node.js imports.
import { serviziMercati } from "./serviziMercati";
import { serviziMusei } from "./serviziMusei";
import { serviziSentieriCaprera } from "./serviziSentieriCaprera";
import { serviziSpiagge } from "./serviziSpiagge";
import { serviziBanche } from "./serviziBanche";
import { serviziFarmacie } from "./serviziFarmacie";
import { serviziSupermercati } from "./serviziSupermercati";
import { serviziEmergenze } from "./serviziEmergenze";
import { serviziTrasporti } from "./serviziTrasporti";
import { serviziVela } from "./serviziVela";
import { serviziDiving } from "./serviziDiving";
import { serviziWindsurfKite } from "./serviziWindsurfKite";
import { serviziGelaterie } from "./serviziGelaterie";
import { serviziNoleggioGommoni } from "./serviziNoleggioGommoni";
import { serviziNoleggioScooterBike } from "./serviziNoleggioScooterBike";

export const zone = [
  "Centro Storico",
  "Cala Gavetta",
  "Padule",
  "Pueblo / Due Strade",
  "Moneta",
  "Caprera",
  "Porto Pollo / Palau",
] as const;

export type Zona = (typeof zone)[number];

export const categorieServizi = [
  "Supermercati",
  "Farmacie",
  "Spiagge",
  "Vela",
  "Diving",
  "Windsurf kite",
  "Gelaterie",
  "Noleggio gommoni",
  "Noleggio scooter e bike",
  "Banche & ATM",
  "Mercato",
  "Trasporti",
  "Emergenze",
  "Musei",
  "Sentieri Caprera",
] as const;

export type CategoriaServizio = (typeof categorieServizi)[number];

export type Servizio = {
  name: string;
  category: CategoriaServizio;
  zona: Zona;
  /** Coordinates in [longitude, latitude]. */
  coordinates?: [number, number];
  /** Cardinal winds the beach is exposed to (e.g. N, NW, W). */
  esposizione?: string[];
  /** Local tip based on wind exposure. */
  maddiTip?: string;
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
  // ─── Vela ───────────────────────────────────────────────────────────────────
  ...serviziVela,

  // ─── Diving ────────────────────────────────────────────────────────────────
  ...serviziDiving,

  // ─── Windsurf kite ──────────────────────────────────────────────────────────
  ...serviziWindsurfKite,

  // ─── Gelaterie ───────────────────────────────────────────────────────────────
  ...serviziGelaterie,

  // ─── Noleggio gommoni ───────────────────────────────────────────────────────
  ...serviziNoleggioGommoni,

  // ─── Noleggio scooter e bike ────────────────────────────────────────────────
  ...serviziNoleggioScooterBike,
  // ─── Banche & ATM ────────────────────────────────────────────────────────────
  ...serviziBanche,

  // ─── Trasporti ───────────────────────────────────────────────────────────────
  ...serviziTrasporti,

  // ─── Emergenze ───────────────────────────────────────────────────────────────
  ...serviziEmergenze,

  // ─── Musei (solo arcipelago: La Maddalena e Caprera) ─────────────────────────
  ...serviziMusei,

  // ─── Sentieri Caprera (luoghi, spiagge e punti panoramici) ───────────────────
  ...serviziSentieriCaprera,
];
