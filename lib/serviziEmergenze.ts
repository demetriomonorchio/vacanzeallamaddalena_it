import type { Servizio } from "./servizi";

/** Forze dell’ordine, sanità d’urgenza e volontariato (dati da elenco Google Maps). */
export const serviziEmergenze: readonly Servizio[] = [
  {
    name: "Carabinieri La Maddalena",
    category: "Emergenze",
    zona: "Centro Storico",
    coordinates: [9.4092716, 41.2158684],
    url: "https://share.google/IJ0JlQ6TxIJhW4qnI",
  },
  {
    name: "Ospedale Paolo Merlo — Pronto soccorso",
    category: "Emergenze",
    zona: "Padule",
    coordinates: [9.4308615, 41.2240530],
    url: "https://maps.google.com/?q=Ospedale+Paolo+Merlo+Pronto+Soccorso,+Via+Ammiraglio+Magnaghi,+La+Maddalena",
    rating: 3.3,
    reviews: 8,
    description:
      "Pronto soccorso · Via Ammiraglio Magnaghi. Aperto 24 ore su 24 · Tel. 0789 791218. «Ottimo con personale infermieristico e medico di grande professionalità.»",
  },
  {
    name: "Ospedale «Paolo Merlo»",
    category: "Emergenze",
    zona: "Padule",
    coordinates: [9.4067977, 41.2175271],
    url: "https://maps.google.com/?q=Ospedale+Paolo+Merlo,+Via+Ammiraglio+Magnaghi,+La+Maddalena",
    rating: 4.1,
    reviews: 40,
    description:
      "Ospedale · Via Ammiraglio Magnaghi · Tel. 0789 791200. «Dottori ed infermiere estremamente disponibili, gentili, attenti e rapidi.»",
  },
  {
    name: "Croce Verde — Associazione volontari del soccorso",
    category: "Emergenze",
    zona: "Padule",
    coordinates: [9.4308615, 41.2240530],
    url: "https://maps.google.com/?q=Croce+Verde+Associazione+Volontari+Soccorso+La+Maddalena,+Via+dell%27Aiaccio+6,+La+Maddalena",
    rating: 5.0,
    reviews: 1,
    description: "Servizio ambulanza · Via dell’Aiaccio, 6 · Tel. 0789 737013.",
  },
  {
    name: "Croce Verde La Maddalena — sede cooperativa",
    category: "Emergenze",
    zona: "Centro Storico",
    coordinates: [9.4074965, 41.2136245],
    url: "https://maps.google.com/?q=Croce+Verde+La+Maddalena,+Piazza+Faravelli+1,+La+Maddalena",
    rating: 5.0,
    reviews: 1,
    description:
      "Servizio ambulanza · P.za Faravelli, 1. Aperto 24 ore su 24 · Tel. 0789 737013.",
  },
  {
    name: "Pronto soccorso — ingresso Terralugiana",
    category: "Emergenze",
    zona: "Padule",
    coordinates: [9.4308615, 41.2240530],
    url: "https://maps.google.com/?q=Pronto+Soccorso,+Via+Terralugiana+1,+La+Maddalena",
    rating: 4.3,
    reviews: 10,
    description:
      "Ospedale · Via Terralugiana, 1. Aperto 24 ore su 24. «Molto cordiali e rassicuranti con il bambino.»",
  },
  {
    name: "Guardia di Finanza — Sezione operativa navale La Maddalena",
    category: "Emergenze",
    zona: "Centro Storico",
    coordinates: [9.4074965, 41.2136245],
    url: "https://maps.google.com/?q=Guardia+di+Finanza+La+Maddalena,+Via+Fabio+Filzi+10,+La+Maddalena",
    description: "Guardia di Finanza · Via Fabio Filzi, 10 · Tel. 0789 737397.",
  },
  {
    name: "Associazione volontari italiani del sangue (AVIS)",
    category: "Emergenze",
    zona: "Centro Storico",
    coordinates: [9.4074965, 41.2136245],
    url: "https://maps.google.com/?q=AVIS+La+Maddalena,+Via+Cristoforo+Colombo+1%C2%B0+traversa+3,+La+Maddalena",
    rating: 5.0,
    reviews: 2,
    description:
      "Volontariato · Via Cristoforo Colombo, 1ª traversa, 3 · Tel. 0789 729017.",
  },
  {
    name: "Polizia locale La Maddalena",
    category: "Emergenze",
    zona: "Padule",
    coordinates: [9.4308615, 41.2240530],
    url: "https://maps.google.com/?q=Polizia+Locale+La+Maddalena,+Via+Agostino+Millelire+12,+La+Maddalena",
    description:
      "Dipartimento di polizia · Via Agostino Millelire, 12. Aperto 24 ore su 24 · Tel. 0789 736015.",
  },
  {
    name: "Capitaneria di porto — Guardia costiera (COMPAMARE La Maddalena)",
    category: "Emergenze",
    zona: "Cala Gavetta",
    coordinates: [9.4057552, 41.2114003],
    url: "https://maps.google.com/?q=Capitaneria+Porto+Guardia+Costiera+La+Maddalena,+Via+Ammiraglio+Mirabello,+La+Maddalena",
    rating: 4.0,
    reviews: 44,
    description:
      "Guardia costiera · V. Ammiraglio Mirabello. Chiuso · apre gio alle ore 09 · Tel. 0789 730632. «Abbiamo trovato non solo grande professionalità ma anche grande umanità.»",
  },
  {
    name: "Protezione civile La Maddalena",
    category: "Emergenze",
    zona: "Moneta",
    coordinates: [9.4322612, 41.2213052],
    url: "https://maps.google.com/?q=Protezione+Civile+La+Maddalena,+Villaggio+Trinit%C3%A0+1101,+La+Maddalena",
    rating: 3.7,
    reviews: 3,
    description: "Associazione · Villaggio Trinità, 1101.",
  },
  {
    name: "Guardia medica di La Maddalena",
    category: "Emergenze",
    zona: "Padule",
    coordinates: [9.4308615, 41.2240530],
    url: "https://maps.google.com/?q=Guardia+Medica+La+Maddalena,+Localit%C3%A0+Padule,+La+Maddalena",
    rating: 3.1,
    reviews: 9,
    description:
      "Centro medico pubblico · Località Padule. Chiuso temporaneamente · Tel. 0789 737023. «Eccellente dall’accoglienza delle guardie giurate al personale medico.»",
  },
];
