import type { Servizio } from "./servizi";

/** Supermercati e alimentari (dati da elenco Google Maps). Esclusi mercati rionali (categoria Mercato). */
export const serviziSupermercati: readonly Servizio[] = [
  {
    name: "CONAD",
    category: "Supermercati",
    zona: "Pueblo / Due Strade",
    coordinates: [9.4308615, 41.2240530],
    url: "https://maps.google.com/?q=CONAD,+Via+G.Mary,+La+Maddalena",
    rating: 4.2,
    reviews: 1315,
    description:
      "Alimentari · Via G. Mary, snc · Tel. 0789 721067. «Ottima posizione e punto per fare la spesa!»",
  },
  {
    name: "Dettori Market Crai Extra",
    category: "Supermercati",
    zona: "Centro Storico",
    coordinates: [9.4111321, 41.2158703],
    url: "https://maps.google.com/?q=Dettori+Market+Crai+Extra,+V.+Principe+Amedeo+1,+La+Maddalena",
    rating: 4.0,
    reviews: 992,
    description:
      "Alimentari · V. Principe Amedeo, 1 · Tel. 0789 738142. «All'interno trovi un bel reparto di gastronomia ed anche la pescheria.»",
  },
  {
    name: "Supermercato Nonna Isa",
    category: "Supermercati",
    zona: "Padule",
    coordinates: [9.4049044, 41.2177379],
    url: "https://maps.google.com/?q=Supermercato+Nonna+Isa,+Via+Suor+Gotteland+6,+La+Maddalena",
    rating: 4.6,
    reviews: 80,
    description:
      "Alimentari · Via Suor Gotteland, 6 · Tel. 0789 737305. «Ottimi frutta e verdura e LA MIGLIORE CARNE DELL'ISOLA.»",
  },
  {
    name: "Dettori Market Crai — Via Padule",
    category: "Supermercati",
    zona: "Padule",
    coordinates: [9.3938302, 41.2110053],
    url: "https://maps.google.com/?q=Dettori+Market+Crai,+Via+Padule+1,+La+Maddalena",
    rating: 3.6,
    reviews: 148,
    description:
      "Alimentari · Via Padule, 1 · Tel. 0789 722100. «Ottimo e conveniente.»",
  },
  {
    name: "Coop — Via Chiusedda",
    category: "Supermercati",
    zona: "Pueblo / Due Strade",
    coordinates: [9.4150933, 41.2220605],
    url: "https://maps.google.com/?q=Coop,+Via+Chiusedda+7,+La+Maddalena",
    rating: 3.9,
    reviews: 121,
    description:
      "Alimentari · Via Chiusedda, 7 · Tel. 0789 723014. «Economico e prodotti che altri non hanno.»",
  },
  {
    name: "MD S.p.A.",
    category: "Supermercati",
    zona: "Padule",
    coordinates: [9.4169763, 41.2194526],
    url: "https://maps.google.com/?q=MD+Supermercati,+Via+Aldo+Moro+7,+La+Maddalena",
    rating: 3.9,
    reviews: 337,
    description:
      "Alimentari · V. Aldo Moro, 7 · Tel. 0789 738812. «È anche più fornito di altri supermercati in zona.»",
  },
  {
    name: "Coop — Via Balbo",
    category: "Supermercati",
    zona: "Padule",
    coordinates: [9.4069260, 41.2159455],
    url: "https://maps.google.com/?q=Coop,+Via+Balbo+53,+La+Maddalena",
    rating: 3.9,
    reviews: 41,
    description:
      "Alimentari · Via Balbo, 53 · Tel. 0789 723014. «Non ai livelli di altri supermercati sull'isola.»",
  },
  {
    name: "Minimarket A Buttega",
    category: "Supermercati",
    zona: "Centro Storico",
    coordinates: [9.3992597, 41.2108718],
    url: "https://maps.google.com/?q=Minimarket+A+Buttega,+Via+Domenico+Millelire+14,+La+Maddalena",
    rating: 4.5,
    reviews: 44,
    description:
      "Alimentari · Via Domenico Millelire, 14 · Tel. 342 933 0181. «Fanno panini imbottiti con ingredienti a scelta.»",
  },
  {
    name: "CRAI La Maddalena — Via Principe Amedeo",
    category: "Supermercati",
    zona: "Centro Storico",
    coordinates: [9.4111321, 41.2158703],
    url: "https://maps.google.com/?q=CRAI+La+Maddalena,+Via+Principe+Amedeo,+La+Maddalena",
    rating: 3.3,
    reviews: 6,
    description:
      "Negozio di alimentari · V. Principe Amedeo · Tel. 0789 754796. «Ottimo ipermercato.»",
  },
  {
    name: "Supermercato Dettori",
    category: "Supermercati",
    zona: "Pueblo / Due Strade",
    coordinates: [9.4103245, 41.2160533],
    url: "https://maps.google.com/?q=Supermercato+D3ttoru,+Via+Caio+Duilio+2,+La+Maddalena",
    rating: 5.0,
    reviews: 1,
    description: "Alimentari · Via Caio Duilio, 2.",
  },
  {
    name: "S&P — Via Balbo",
    category: "Supermercati",
    zona: "Padule",
    coordinates: [9.4069260, 41.2159455],
    url: "https://maps.google.com/?q=S%26P,+Via+Balbo+53,+La+Maddalena",
    rating: 4.8,
    reviews: 6,
    description:
      "Alimentari · Via Balbo, 53 · Tel. 0789 737180. Acquisti e ritiro in negozio.",
  },
  {
    name: "Supermercati Comitipollas",
    category: "Supermercati",
    zona: "Centro Storico",
    coordinates: [9.4072009, 41.2125120],
    url: "https://maps.google.com/?q=Supermercati+Comitipollas,+Via+Amendola+4,+La+Maddalena",
    rating: 2.0,
    reviews: 2,
    description:
      "Centro commerciale · Via Amendola, 4 · Tel. 373 541 4320. «Qui si può trovare tutto il necessario per una giornata al mare.»",
  },
].map((servizio) => ({ isFavorite: false, maddiNote: "", ...(servizio as Servizio) }));
