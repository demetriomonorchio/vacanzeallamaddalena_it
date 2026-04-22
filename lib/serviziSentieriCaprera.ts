import type { Servizio } from "./servizi";

/**
 * Sentieri e luoghi (Caprera, La Maddalena, arcipelago) — dati da elenco Google Maps:
 * rating, recensioni, tipologia, indirizzo, orari e citazioni utenti.
 */
export const serviziSentieriCaprera: readonly Servizio[] = [
  {
    name: "Sentiero Monte Tejalone",
    category: "Sentieri Caprera",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Sentiero+Monte+Tejalone,+Caprera",
    rating: 5.0,
    reviews: 26,
    description:
      "Area per passeggiate · Caprera. Aperto 24 ore su 24. «La vista sulla costa di Caprera, in particolare su Cala Coticcio, è suprema.»",
  },
  {
    name: "Spiaggia di Punta Crucitta",
    category: "Sentieri Caprera",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Spiaggia+di+Punta+Crucitta,+Piazza+Caprera,+Caprera",
    rating: 4.6,
    reviews: 193,
    description:
      "Attrazione turistica · Piazza Caprera. Aperto 24 ore su 24. «Un po' accidentato il sentiero per arrivarci, importante avere scarpe adatte.»",
  },
  {
    name: "Conigliera",
    category: "Sentieri Caprera",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Conigliera,+Via+Benvenuto+Cellini,+Caprera",
    rating: 4.5,
    reviews: 43,
    description:
      "Area per passeggiate · Via Benvenuto Cellini. Aperto 24 ore su 24. «Un ottimo allenamento prima di affrontare sentieri un po' più impegnativi.»",
  },
  {
    name: "Parco Nazionale dell'Arcipelago di La Maddalena",
    category: "Sentieri Caprera",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Parco+Nazionale+Arcipelago+La+Maddalena,+Via+Giulio+Cesare+7,+La+Maddalena",
    rating: 4.8,
    reviews: 9136,
    description:
      "Parco nazionale · Via Giulio Cesare, 7. Parco marino con numerose isole. Chiuso · apre lun alle ore 09:30. «Un luogo fantastico, assolutamente da vedere e vivere per terra e per mare.»",
  },
  {
    name: "Guida Ambientale Escursionistica — Trekking Tours — Sardinia Hikes",
    category: "Sentieri Caprera",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Guida+Ambientale+Escursionistica+Trekking+Tours,+Via+Chiusedda+19,+La+Maddalena",
    rating: 4.9,
    reviews: 71,
    description:
      "Agenzia di visite turistiche · Via Chiusedda, 19. Aperto · chiude alle ore 19. «Non riesco a trovare le parole per descrivere la bellezza del posto!»",
  },
  {
    name: "Cala Andreani",
    category: "Sentieri Caprera",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Cala+Andreani,+Caprera",
    rating: 4.7,
    reviews: 1265,
    description:
      "Attrazione turistica · Caprera. Aperto 24 ore su 24. «Spettacolare, raggiungibile consigliato con bici o scooter nonché auto.»",
  },
  {
    name: "Spiaggia di Punta Tegge",
    category: "Sentieri Caprera",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Spiaggia+di+Punta+Tegge,+Localit%C3%A0+Punta+Tegge+3,+Caprera",
    rating: 4.6,
    reviews: 2391,
    description:
      "Attrazione turistica · Località Punta Tegge, 3. Cala rocciosa, spiagge note, immersioni. Aperto 24 ore su 24. «A piedi il percorso è di circa 30 minuti dal parcheggio.»",
  },
  {
    name: "Poggio Stefano",
    category: "Sentieri Caprera",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Poggio+Stefano,+Caprera",
    rating: 4.9,
    reviews: 31,
    description:
      "Area per passeggiate · Caprera. Aperto 24 ore su 24. «20 minuti di sentiero e il panorama di cui si gode è impagabile.»",
  },
  {
    name: "Spargi La Maddalena SS — Spiaggia di Cala Corsara",
    category: "Sentieri Caprera",
    zona: "Moneta",
    url: "https://maps.google.com/?q=Spiaggia+Cala+Corsara,+Isola+Spargi,+La+Maddalena",
    rating: 4.8,
    reviews: 2648,
    description:
      "Spiaggia · Str. Padulacciu (Spargi). Spiaggia pittoresca in baia rocciosa. «Arrivando qui sono rimasta scioccata dalla bellezza mozzafiato del luogo.»",
  },
  {
    name: "Spiaggia dello Strangolato",
    category: "Sentieri Caprera",
    zona: "Moneta",
    url: "https://maps.google.com/?q=Spiaggia+dello+Strangolato,+La+Maddalena",
    rating: 4.5,
    reviews: 418,
    description:
      "Spiaggia · La Maddalena. «Bella spiaggetta con molte zone dove poter stare tranquilli e isolati.»",
  },
  {
    name: "Messa del Cervo",
    category: "Sentieri Caprera",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Messa+del+Cervo,+Caprera",
    rating: 4.6,
    reviews: 23,
    description:
      "Attrazione turistica · Caprera. Aperto 24 ore su 24. «Posto incantevole, natura e silenzio — La Maddalena unica.»",
  },
  {
    name: "Spiaggia di Cala Coticcio",
    category: "Sentieri Caprera",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Cala+Coticcio,+Strada+Cala+Garibaldi+Arbuticci,+Caprera",
    rating: 4.7,
    reviews: 2376,
    description:
      "Spiaggia · Str. Cala Garibaldi–Arbuticci. Caletta suggestiva tra scogliere. «Si trova in un'area protetta, con accessi regolamentati.»",
  },
  {
    name: "Spiaggia Testa del Polpo",
    category: "Sentieri Caprera",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Spiaggia+Testa+del+Polpo,+Caprera",
    rating: 4.6,
    reviews: 1656,
    description:
      "Attrazione turistica · Caprera. Tratto di sabbia bianca con scogli affioranti. Ora aperto. «Accesso dal parcheggio non comodissimo a piedi, ma ne vale ugualmente la pena.»",
  },
  {
    name: "Pineta di Caprera",
    category: "Sentieri Caprera",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Pineta+di+Caprera,+Compendio+Garibaldino,+Caprera",
    rating: 4.5,
    reviews: 147,
    description:
      "Riserva naturale · Compendio Garibaldino. Aperto 24 ore su 24. «Posto tranquillo che dà a Caprera la perfezione.»",
  },
  {
    name: "Elena Tour Navigazioni — Escursioni in barca La Maddalena — Noleggio barche",
    category: "Sentieri Caprera",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Elena+Tour+Navigazioni,+Via+Amendola,+La+Maddalena",
    rating: 4.6,
    reviews: 944,
    description:
      "Agenzia di escursioni in barca · Via Amendola, Snc. Aperto · chiude alle ore 17. «Il modo migliore per esplorare l'arcipelago via mare!»",
  },
  {
    name: "Cala Francese",
    category: "Sentieri Caprera",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Cala+Francese,+Caprera",
    rating: 4.6,
    reviews: 290,
    description:
      "Attrazione turistica · Caprera. Aperto 24 ore su 24. «Si può entrare anche in auto ma sarebbe uno scempio per la natura.»",
  },
  {
    name: "Cala Degli Inglesi",
    category: "Sentieri Caprera",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Cala+Degli+Inglesi,+Piazza+Caprera,+Caprera",
    rating: 4.6,
    reviews: 202,
    description:
      "Attrazione turistica · Piazza Caprera. Aperto 24 ore su 24. «Un sentiero da percorrere con scarpe adatte vi condurrà in paradiso.»",
  },
  {
    name: "Spiaggia Punta Rossa Corsara",
    category: "Sentieri Caprera",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Spiaggia+Punta+Rossa+Corsara,+Strada+Padulacciu,+Caprera",
    rating: 4.7,
    reviews: 141,
    description:
      "Spiaggia · Strada Padulacciu. «Te ne innamorerai al primo sguardo...»",
  },
  {
    name: "Cala Napoletana",
    category: "Sentieri Caprera",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Cala+Napoletana,+Strada+Cala+Garibaldi+Arbuticci,+Caprera",
    rating: 4.7,
    reviews: 898,
    description:
      "Spiaggia · Str. Cala Garibaldi–Arbuticci. «Consiglio anello seguendo sentiero 12 che tocca tre bellissime callette.»",
  },
  {
    name: "Abbatoggia",
    category: "Sentieri Caprera",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Abbatoggia,+Strada+Panoramica,+Caprera",
    rating: 4.0,
    reviews: 74,
    description:
      "Attrazione turistica · Strada Panoramica. Aperto · chiude alle ore 22. «A piedi... gratis!!!»",
  },
  {
    name: "Batteria di Candeo",
    category: "Sentieri Caprera",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Batteria+di+Candeo,+Caprera",
    rating: 4.8,
    reviews: 82,
    description:
      "Attrazione turistica · Caprera. Aperto 24 ore su 24. «Se vi trovate nei paraggi consiglio vivamente una passeggiata per una visita.»",
  },
  {
    name: "Punto panoramico",
    category: "Sentieri Caprera",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Punto+panoramico+Caprera,+Regione+Nido+d%27Aquila",
    rating: 4.8,
    reviews: 181,
    description:
      "Punto panoramico · Regione Nido d'Aquila, 5. Aperto 24 ore su 24. «Magnifico punto di osservazione verso le isole dell'arcipelago e la Corsica.»",
  },
  {
    name: "Maneggio Cala Spalmatore — La Maddalena",
    category: "Sentieri Caprera",
    zona: "Moneta",
    url: "https://maps.google.com/?q=Maneggio+Cala+Spalmatore,+Localit%C3%A0+Spalmatore+4,+La+Maddalena",
    rating: 4.9,
    reviews: 70,
    description:
      "Maneggio · Località Spalmatore, 4. Aperto 24 ore su 24. «Fantastica passeggiata a cavallo tra sentieri e mare.»",
  },
  {
    name: "Cala Serena",
    category: "Sentieri Caprera",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Cala+Serena,+Caprera",
    rating: 4.7,
    reviews: 210,
    description:
      "Attrazione turistica · Caprera. Ora aperto. «Magnifico percorso a piedi da fare non in ciabatte.»",
  },
  {
    name: "Cala di Roto (spiaggia rosa)",
    category: "Sentieri Caprera",
    zona: "Moneta",
    url: "https://maps.google.com/?q=Cala+di+Roto,+Isola+Budelli,+La+Maddalena",
    rating: 4.7,
    reviews: 403,
    description:
      "Riserva nazionale · Isola Budelli. Ora aperto. «Sulla spiaggia è vietato sbarcare, si vede solo dalla barca.»",
  },
  {
    name: "Spiaggia I due Mari",
    category: "Sentieri Caprera",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Spiaggia+I+due+Mari,+Isola+di+Caprera",
    rating: 4.5,
    reviews: 1437,
    description:
      "Spiaggia · Isola di Caprera. «La più bella spiaggia della Maddalena per il colore turchese e la sabbia bianca.»",
  },
  {
    name: "Guardia Vecchia",
    category: "Sentieri Caprera",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Guardia+Vecchia,+Caprera",
    rating: 5.0,
    reviews: 3,
    description: "Cima di montagna · Caprera.",
  },
  {
    name: "Maggior Leggero Tour — Gite in barca La Maddalena",
    category: "Sentieri Caprera",
    zona: "Centro Storico",
    url: "https://maps.google.com/?q=Maggior+Leggero+Tour,+Piazza+del+Molo,+La+Maddalena",
    rating: 4.6,
    reviews: 419,
    description:
      "Agenzia di escursioni in barca · Piazza del Molo. Aperto · chiude alle ore 23:30. «Luoghi spettacolari, consiglio vivamente a tutti anche per famiglie.»",
  },
  {
    name: "Monte Teialone",
    category: "Sentieri Caprera",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Monte+Teialone,+Caprera",
    rating: 4.9,
    reviews: 36,
    description:
      "Cima di montagna · Caprera. «Con un buon passo 30/40 min.»",
  },
  {
    name: "Capocchia d'ù purpu",
    category: "Sentieri Caprera",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Capocchia+d%27%C3%B9+purpu,+Caprera",
    rating: 4.7,
    reviews: 676,
    description:
      "Attrazione turistica · Caprera. Aperto 24 ore su 24. «Roccia caratteristica in una spiaggia spettacolare.»",
  },
  {
    name: "Spiaggia di Bassa Trinita",
    category: "Sentieri Caprera",
    zona: "Pueblo / Due Strade",
    url: "https://maps.google.com/?q=Spiaggia+di+Bassa+Trinita,+La+Maddalena",
    rating: 4.7,
    reviews: 1523,
    description:
      "Spiaggia · La Maddalena. Spiaggia con 3 calette e sentiero naturale. «Stupenda spiaggia con mare mozzafiato — portarsi l'ombrellone!»",
  },
  {
    name: "Spiaggia Messa del Cervo",
    category: "Sentieri Caprera",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Spiaggia+Messa+del+Cervo,+Caprera",
    rating: 4.6,
    reviews: 62,
    description:
      "Spiaggia · Caprera. «È uno dei sentieri più lunghi di Caprera ma è un dovere percorrerlo.»",
  },
  {
    name: "Cala Caprarese",
    category: "Sentieri Caprera",
    zona: "Caprera",
    url: "https://maps.google.com/?q=Cala+Caprarese,+Piazza+Caprera,+Caprera",
    rating: 4.4,
    reviews: 148,
    description:
      "Attrazione turistica · Piazza Caprera. Aperto 24 ore su 24. «Il fondale è molto caratteristico, i colori fantastici.»",
  },
].map((servizio) => ({ isFavorite: false, maddiNote: "", ...(servizio as Servizio) }));
