import type { Servizio } from "./servizi";

/** Musei dell'arcipelago da elenco Google Maps (rating e recensioni come da risultati). */
export const serviziMusei: readonly Servizio[] = [
  {
    name: "Compendio Garibaldino",
    category: "Musei",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Compendio+Garibaldino,+Isola+di+Caprera",
    rating: 4.4,
    reviews: 1979,
    description:
      "Sito storico, casa-museo del generale italiano. «Suggerimento che darei ai gestori è quello di dotarsi di sistema audioguide.»",
  },
  {
    name: "Casa e Tomba di Garibaldi",
    category: "Musei",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Casa+e+Tomba+di+Garibaldi,+Compendio+Garibaldino,+Caprera",
    rating: 4.3,
    reviews: 1662,
    description:
      "Museo di storia nel Compendio Garibaldino. «Una visita imprescindibile se si va a La Maddalena e Caprera.»",
  },
  {
    name: "Museo Diocesano di La Maddalena",
    category: "Musei",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Museo+Diocesano+La+Maddalena,+Via+Barone+Manno+2",
    rating: 4.0,
    reviews: 4,
    description:
      "Museo del patrimonio culturale · Via Barone Manno, 2. Chiuso · apre gio alle ore 10.",
  },
  {
    name: "Batteria Arbuticci — Memoriale Giuseppe Garibaldi",
    category: "Musei",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Batteria+Arbuticci+Memoriale+Giuseppe+Garibaldi,+Strada+Cala+Garibaldi+Arbuticci,+Caprera",
    rating: 4.4,
    reviews: 753,
    description:
      "Museo · Str. Cala Garibaldi–Arbuticci. «Museo molto interessante, racconta la vita di Garibaldi e le sue imprese.»",
  },
  {
    name: "Museo Cava Francese",
    category: "Musei",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Museo+Cava+Francese,+La+Maddalena",
    rating: 4.2,
    reviews: 38,
    description:
      "Museo del patrimonio culturale. Aperto 24 ore su 24. «Interessantissimo da vedere sicuramente.»",
  },
  {
    name: "Museo del Mare e delle tradizioni marinaresche",
    category: "Musei",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Museo+del+Mare+e+delle+tradizioni+marinaresche,+Borgo+di+Stagnali,+Caprera",
    rating: 4.4,
    reviews: 46,
    description:
      "Museo marittimo · Borgo di Stagnali. Chiuso temporaneamente. «Ideale per scolaresche e turisti curiosi.»",
  },
  {
    name: "Museo geo-mineralogico naturalistico di La Maddalena-Caprera",
    category: "Musei",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Museo+geo-mineralogico+naturalistico+La+Maddalena+Caprera,+Borgo+di+Stagnali+6,+Caprera",
    rating: 4.6,
    reviews: 124,
    description:
      "Museo · Borgo di Stagnali, 6. Chiuso temporaneamente. «Museo interessante, molto provvisto.»",
  },
];
