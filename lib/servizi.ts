// Client-safe — no Node.js imports.

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
  "Banche & ATM",
  "Ospedale",
  "Mercato",
  "Trasporti",
  "Emergenze",
] as const;

export type CategoriaServizio = (typeof categorieServizi)[number];

export type Servizio = {
  name: string;
  category: CategoriaServizio;
  zona: Zona;
  /** Google Maps short or full URL */
  url?: string;
};

export const servizi: readonly Servizio[] = [
  // ─── Supermercati ────────────────────────────────────────────────────────────
  {
    name: "Dettori Market Crai Extra",
    category: "Supermercati",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Dettori+Market+Crai+Extra,+V.+Principe+Amedeo+1,+La+Maddalena",
  },
  {
    name: "CRAI La Maddalena — Via Principe Amedeo",
    category: "Supermercati",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=CRAI+Via+Principe+Amedeo,+La+Maddalena",
  },
 
  {
    name: "Minimarket A Buttega",
    category: "Supermercati",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Minimarket+A+Buttega,+Via+Domenico+Millelire+14,+La+Maddalena",
  },
  {
    name: "Le Delizie Sarde Market",
    category: "Supermercati",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Le+Delizie+Sarde+Market,+Via+Guglielmo+Oberdan,+La+Maddalena",
  },
  {
    name: "Supermercati Comitipollas",
    category: "Supermercati",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Supermercati+Comitipollas,+Via+Amendola+4,+La+Maddalena",
  },
  {
    name: "CONAD",
    category: "Supermercati",
    zona: "Pueblo / Due Strade",
    url: "https://maps.google.com/?q=CONAD,+Via+G.Mary,+La+Maddalena",
  },
  {
    name: "MD S.p.A.",
    category: "Supermercati",
    zona: "Padule",
    url: "https://maps.google.com/?q=MD+Supermercati,+Via+Aldo+Moro+7,+La+Maddalena",
  },
  {
    name: "Dettori Market Crai — Via Padule",
    category: "Supermercati",
    zona: "Padule",
    url: "https://maps.google.com/?q=Dettori+Market+Crai,+Via+Padule+1,+La+Maddalena",
  },
  {
    name: "Coop — Via Balbo",
    category: "Supermercati",
    zona: "Padule",
    url: "https://maps.google.com/?q=Coop,+Via+Balbo+53,+La+Maddalena",
  },
  {
    name: "Market Abc Pam — Via Balbo",
    category: "Supermercati",
    zona: "Padule",
    url: "https://maps.google.com/?q=Market+Abc+Pam,+Via+Balbo+53,+La+Maddalena",
  },
  {
    name: "Supermercato Nonna Isa",
    category: "Supermercati",
    zona: "Padule",
    url: "https://maps.google.com/?q=Supermercato+Nonna+Isa,+Via+Suor+Gotteland+6,+La+Maddalena",
  },
  {
    name: "Coop — Via Chiusedda",
    category: "Supermercati",
    zona: "Pueblo / Due Strade",
    url: "https://maps.google.com/?q=Coop,+Via+Chiusedda+7,+La+Maddalena",
  },
  {
    name: "Supermercato D3ttoru",
    category: "Supermercati",
    zona: "Pueblo / Due Strade",
    url: "https://maps.google.com/?q=Supermercato+D3ttoru,+Via+Caio+Duilio+2,+La+Maddalena",
  },
  {
    name: "Frutta e Verdura (mercatino)",
    category: "Supermercati",
    zona: "Centro Storico",
  },

  // ─── Mercato ─────────────────────────────────────────────────────────────────
  {
    name: "Mercato del Porto (mar–sab mattina)",
    category: "Mercato",
    zona: "Cala Gavetta",
    url: "https://maps.app.goo.gl/uVNLDVDk4LkjkbPB6",
  },

  // ─── Farmacie ────────────────────────────────────────────────────────────────
  {
    name: "Farmacia Dr Max",
    category: "Farmacie",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Piazza+Santa+Maria+Maddalena+5,+La+Maddalena",
  },
  {
    name: "Farmacia (turno notturno — rotazione)",
    category: "Farmacie",
    zona: "Centro Storico",
  },

  // ─── Banche & ATM ────────────────────────────────────────────────────────────
  {
    name: "Banca di Sassari — ATM",
    category: "Banche & ATM",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Via+Amendola,+La+Maddalena",
  },
  {
    name: "Poste Italiane — Bancomat",
    category: "Banche & ATM",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Piazza+Umberto+I,+La+Maddalena",
  },
  {
    name: "Banco di Sardegna — ATM",
    category: "Banche & ATM",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Via+XX+Settembre,+La+Maddalena",
  },

  // ─── Ospedale ────────────────────────────────────────────────────────────────
  {
    name: "Ospedale Paolo Merlo — Pronto Soccorso",
    category: "Ospedale",
    zona: "Padule",
    url: "https://maps.google.com/?q=Via+Ammiraglio+Magnaghi,+La+Maddalena",
  },
  {
    name: "Guardia Medica (stagionale) — Via Giulio Cesare",
    category: "Ospedale",
    zona: "Centro Storico",
  },

  // ─── Trasporti ───────────────────────────────────────────────────────────────
  {
    name: "Porto di Cala Gavetta — traghetti per Palau",
    category: "Trasporti",
    zona: "Cala Gavetta",
    url: "https://maps.app.goo.gl/uVNLDVDk4LkjkbPB6",
  },
  {
    name: "Fermata Bus Piazza Comando",
    category: "Trasporti",
    zona: "Centro Storico",
  },
  {
    name: "Fermata Bus Moneta (spiagge nord)",
    category: "Trasporti",
    zona: "Moneta",
  },
  {
    name: "Noleggio auto / scooter — Cala Gavetta",
    category: "Trasporti",
    zona: "Cala Gavetta",
  },

  // ─── Emergenze ───────────────────────────────────────────────────────────────
  {
    name: "Carabinieri La Maddalena",
    category: "Emergenze",
    zona: "Centro Storico",
    url: "https://share.google/IJ0JlQ6TxIJhW4qnI",
  },
  {
    name: "Capitaneria di Porto",
    category: "Emergenze",
    zona: "Cala Gavetta",
    url: "https://maps.google.com/?q=Capitaneria+Porto+La+Maddalena",
  },
  {
    name: "Polizia Municipale",
    category: "Emergenze",
    zona: "Centro Storico",
  },
];
