import type { Servizio } from "./servizi";

/** Mercati e mercatini (dati da elenco Google Maps). */
export const serviziMercati: readonly Servizio[] = [
  {
    name: "Mercato del Porto (mar–sab mattina)",
    category: "Mercato",
    zona: "Cala Gavetta",
    coordinates: [9.4057552, 41.2114003],
    url: "https://maps.app.goo.gl/uVNLDVDk4LkjkbPB6",
    description: "Banchine del porto, mattina.",
  },
  {
    name: "Mercato del mercoledì",
    category: "Mercato",
    zona: "Moneta",
    coordinates: [9.4322612, 41.2213052],
    url: "https://maps.google.com/?q=Mercato+del+mercoled%C3%AC,+Localit%C3%A0+Giardinelli+1-4,+La+Maddalena",
    rating: 4.1,
    reviews: 117,
    description:
      "Mercato · Località Giardinelli, 1–4. Aperto · chiude alle ore 20:30.",
  },
  {
    name: "Mercato civico",
    category: "Mercato",
    zona: "Centro Storico",
    coordinates: [9.4074965, 41.2136245],
    url: "https://maps.google.com/?q=Mercato+civico,+Piazza+Giuseppe+Garibaldi+30,+La+Maddalena",
    rating: 4.1,
    reviews: 21,
    description: "Mercato · Piazza Giuseppe Garibaldi, 30. Servizi in loco.",
  },
];
