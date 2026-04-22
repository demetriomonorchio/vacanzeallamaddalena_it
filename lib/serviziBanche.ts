import type { Servizio } from "./servizi";

/** Banche, uffici postali e bancomat (dati da elenco Google Maps). */
export const serviziBanche: readonly Servizio[] = [
  {
    name: "Poste Italiane — Piazza Umberto I",
    category: "Banche & ATM",
    zona: "Centro Storico",
    coordinates: [9.4086439, 41.2138918],
    url: "https://maps.google.com/?q=Poste+Italiane,+Piazza+Umberto+I+2,+La+Maddalena",
    rating: 2.3,
    reviews: 33,
    description:
      "Ufficio postale · Piazza Umberto I, 2 · Tel. 0789 790931. «Eccezionale.»",
  },
  {
    name: "Intesa Sanpaolo",
    category: "Banche & ATM",
    zona: "Centro Storico",
    coordinates: [9.4064972, 41.2122843],
    url: "https://maps.google.com/?q=Intesa+Sanpaolo,+Via+Amendola+6/A,+La+Maddalena",
    rating: 2.7,
    reviews: 11,
    description:
      "Banca · Via Amendola, 6/A · Tel. 0789 737384. «Ogni volta che vado alla cassa trovo Andrea che mi risolve sempre i problemi.»",
  },
  {
    name: "Banco di Sardegna",
    category: "Banche & ATM",
    zona: "Centro Storico",
    coordinates: [9.4053831, 41.2121158],
    url: "https://maps.google.com/?q=Banco+di+Sardegna,+Via+Amendola+1,+La+Maddalena",
    rating: 1.6,
    reviews: 7,
    description: "Banca · Via Amendola, 1 · Tel. 0789 7911.",
  },
  {
    name: "Poste Italiane — Via Benvenuto Cellini",
    category: "Banche & ATM",
    zona: "Padule",
    coordinates: [9.4306346, 41.2198881],
    url: "https://maps.google.com/?q=Poste+Italiane,+Via+Benvenuto+Cellini,+La+Maddalena",
    rating: 5.0,
    reviews: 4,
    description: "Ufficio postale · Via Benvenuto Cellini · Tel. 0789 727156.",
  },
  {
    name: "Banca di Sassari — banchina traghetti",
    category: "Banche & ATM",
    zona: "Cala Gavetta",
    coordinates: [9.4057552, 41.2114003],
    url: "https://maps.google.com/?q=Banca+di+Sassari,+Banchina+Commerciale+Imbarco+Traghetti+Palau,+La+Maddalena",
    description:
      "Banca · banchina commerciale imbarco traghetti per Palau. Apre gio alle ore 08:20.",
  },
  {
    name: "Euronet ATM",
    category: "Banche & ATM",
    zona: "Centro Storico",
    coordinates: [9.4074965, 41.2136245],
    url: "https://maps.google.com/?q=Euronet+ATM,+Via+Giuseppe+Garibaldi+37,+La+Maddalena",
    description: "Bancomat · Via Giuseppe Garibaldi, 37.",
  },
];
