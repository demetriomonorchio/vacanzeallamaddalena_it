import type { Servizio } from "./servizi";

/** Centri diving (dati da elenco Google Maps). */
export const serviziDiving: readonly Servizio[] = [
  {
    name: "La Maddalena Diving ASD",
    category: "Diving",
    zona: "Moneta",
    coordinates: [9.4322612, 41.2213052],
    url: "https://maps.google.com/?q=La+Maddalena+Diving+ASD,+Localit%C3%A0+Punta+Tegge+3,+La+Maddalena",
    rating: 4.5,
    reviews: 56,
    description: "Grande professionalita ed esperienza.",
  },
  {
    name: "AREA11 DIVING CENTER",
    category: "Diving",
    zona: "Padule",
    coordinates: [9.4308615, 41.2240530],
    url: "https://maps.google.com/?q=AREA11+DIVING+CENTER,+Via+Padule+100,+La+Maddalena",
    rating: 4.5,
    reviews: 86,
    description: "Professionalita, cortesia e simpatia.",
  },
  {
    name: "Diving Argonauta La Maddalena",
    category: "Diving",
    zona: "Moneta",
    coordinates: [9.4322612, 41.2213052],
    url: "https://maps.google.com/?q=Diving+Argonauta+La+Maddalena,+La+Maddalena",
    rating: 5.0,
    reviews: 75,
    description: "In grado di metterti a tuo agio e farti sentire sicuro.",
  },
];