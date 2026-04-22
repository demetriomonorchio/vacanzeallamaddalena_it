import type { Servizio } from "./servizi";

/** Farmacie (dati da elenco Google Maps). */
export const serviziFarmacie: readonly Servizio[] = [
  {
    name: "Farmacia Dr. Max — Principe Amedeo",
    category: "Farmacie",
    zona: "Centro Storico",
    coordinates: [9.4172503, 41.2172626],
    url: "https://maps.google.com/?q=Farmacia+Dr.+Max,+Via+Principe+Amedeo,+La+Maddalena",
    rating: 3.4,
    reviews: 67,
    description:
      "V. Principe Amedeo, snc · Tel. 0789 737055. «Ben fornita, grande cortesia del personale.»",
  },
  {
    name: "Farmacia Piazza di Chiesa",
    category: "Farmacie",
    zona: "Centro Storico",
    coordinates: [9.4074965, 41.2136245],
    url: "https://maps.google.com/?q=Farmacia+Piazza+di+Chiesa,+Via+Santa+Maria+5/B,+La+Maddalena",
    rating: 4.4,
    reviews: 42,
    description:
      "Via S. Maria, 5/B · Tel. 0789 737387. «Gentilezza e disponibilità al top.»",
  },
  {
    name: "Farmacia Dr. Max — Via Amendola",
    category: "Farmacie",
    zona: "Centro Storico",
    coordinates: [9.4053773, 41.2131655],
    url: "https://maps.google.com/?q=Farmacia+Dr.+Max,+Via+Amendola+67,+La+Maddalena",
    rating: 3.6,
    reviews: 27,
    description:
      "Via Amendola, 67 · Tel. 0789 737390. «Bel punto vendita, ben organizzato e con personale preparato e competente.»",
  },
];
