import type { Servizio } from "./servizi";

/** Trasporti, traghetti, taxi e collegamenti (dati da elenco Google Maps). */
export const serviziTrasporti: readonly Servizio[] = [
  {
    name: "SF Trasporti",
    category: "Trasporti",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=SF+Trasporti,+Via+Principe+Amedeo+32,+La+Maddalena",
    description:
      "Servizi di trasporto · V. Principe Amedeo, 32 · Tel. 377 325 4335 · Servizi in loco.",
  },
  {
    name: "Maddalena Lines",
    category: "Trasporti",
    zona: "Padule",
    url: "https://maps.google.com/?q=Maddalena+Lines,+Via+Domenico+Millelire+84,+La+Maddalena",
    rating: 3.4,
    reviews: 361,
    description:
      "Servizio traghetti · Via Domenico Millelire, 84 · Tel. 0789 739165. «Costo a fine aprile Euro 13 a tratta per 2 adulti e una moto.»",
  },
  {
    name: "Taxi e minibus Roberto Musa La Maddalena",
    category: "Trasporti",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Taxi+Roberto+Musa+La+Maddalena,+Via+Indipendenza+17,+La+Maddalena",
    rating: 5.0,
    reviews: 20,
    description:
      "Servizio taxi · Via Indipendenza, 17 · Tel. 347 370 6074. «Prezzo molto corretto e persone molto gentile.»",
  },
  {
    name: "Fermata autobus Colonna Garibaldi",
    category: "Trasporti",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Fermata+autobus+Colonna+Garibaldi,+Via+Amendola,+La+Maddalena",
    rating: 3.8,
    reviews: 9,
    description: "Trasporti in autobus · Via Amendola.",
  },
  {
    name: "Taxi La Maddalena di Giovanni Michele Lisai",
    category: "Trasporti",
    zona: "Pueblo / Due Strade",
    url: "https://maps.google.com/?q=Taxi+Giovanni+Michele+Lisai+La+Maddalena,+Via+Chiusedda+46,+La+Maddalena",
    rating: 5.0,
    reviews: 8,
    description:
      "Servizio taxi · Via Chiusedda, 46 · Tel. 340 584 1012. «Grande professionista.»",
  },
  {
    name: "Biglietteria Maddalena Lines",
    category: "Trasporti",
    zona: "Cala Gavetta",
    url: "https://maps.google.com/?q=Biglietteria+Maddalena+Lines,+Banchina+Commerciale+Imbarco+Traghetti+Palau,+La+Maddalena",
    rating: 4.0,
    reviews: 191,
    description:
      "Servizio traghetti · Banchina commerciale imbarco traghetti per Palau. «Personale gentile e competente.»",
  },
  {
    name: "Dario's Taxi La Maddalena",
    category: "Trasporti",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Dario%27s+Taxi+La+Maddalena,+Via+don+Vico,+La+Maddalena",
    rating: 4.8,
    reviews: 50,
    description:
      "Servizio taxi · Via don Vico, snc · Tel. 340 226 1030. «Consigliatissimo per chiunque visita l'isola e non sa come organizzarsi.»",
  },
  {
    name: "Taxi La Maddalena di Cristina Ciaralli",
    category: "Trasporti",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Taxi+Cristina+Ciaralli+La+Maddalena,+Via+Indipendenza+10,+La+Maddalena",
    rating: 4.8,
    reviews: 96,
    description:
      "Servizio taxi · Via Indipendenza, 10 · Tel. 340 874 4037. «Ringrazio Cristina per la puntualità, la cortesia e la disponibilità.»",
  },
  {
    name: "Porto di La Maddalena",
    category: "Trasporti",
    zona: "Cala Gavetta",
    url: "https://maps.google.com/?q=Porto+di+La+Maddalena,+Cala+Gavetta",
    rating: 4.5,
    reviews: 222,
    description:
      "Terminal traghetti. «Un porto piccolo molto curato attenti a tutte le esigenze di sicurezza.»",
  },
  {
    name: "Taxi La Maddalena Giuseppe Meo",
    category: "Trasporti",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Taxi+Giuseppe+Meo+La+Maddalena,+Via+Maggiore+Leggero+9,+La+Maddalena",
    rating: 4.9,
    reviews: 97,
    description:
      "Servizio taxi · Via Maggiore Leggero, 9 · Tel. 340 361 6466. «Quello che cerco in un servizio taxi.. davvero la scelta migliore sull'isola.»",
  },
  {
    name: "Acciaro Trasporto Barche",
    category: "Trasporti",
    zona: "Cala Gavetta",
    url: "https://maps.google.com/?q=Acciaro+Trasporto+Barche,+La+Maddalena",
    rating: 4.0,
    reviews: 3,
    description:
      "Servizi di trasporto · Tel. 320 232 9637. «Servizio eccellente, autista serio e professionale.»",
  },
  {
    name: "UPS Access Point",
    category: "Trasporti",
    zona: "Padule",
    url: "https://maps.google.com/?q=UPS+Access+Point,+Via+Aldo+Moro+2,+La+Maddalena",
    description:
      "Spedizioni e corrispondenza · V. Aldo Moro, 2. Aperto · chiude alle ore 20.",
  },
  {
    name: "Ponte di Caprera",
    category: "Trasporti",
    zona: "Padule",
    url: "https://maps.google.com/?q=Ponte+di+Caprera,+Via+Benvenuto+Cellini,+La+Maddalena",
    rating: 4.5,
    reviews: 81,
    description:
      "Ponte · Via Benvenuto Cellini. Aperto 24 ore su 24. «Si tratta di una diga/ponte che collega La Maddalena con Caprera.»",
  },
  {
    name: "Veliero Lybra di Giuseppe Meo",
    category: "Trasporti",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Veliero+Lybra+Giuseppe+Meo,+Via+Maggiore+Leggero+9,+La+Maddalena",
    rating: 5.0,
    reviews: 6,
    description:
      "Escursioni turistiche in barca · Via Maggiore Leggero, 9 · Tel. 340 361 6466. «Bellissima esperienza in barca.»",
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
];
