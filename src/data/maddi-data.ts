// src/data/maddi-data.ts

export type LocationType = 'alloggio' | 'ristorante' | 'esperienza' | 'punto-foto';

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  coordinates: [number, number]; // [Longitudine, Latitudine]
  description: string;
  maddiTip: string; // Il consiglio personalizzato di Maddì
  image?: string;
}

export const MADDI_LOCATIONS: Location[] = [
  // --- I TUOI ALLOGGI ---
  {
    id: 'casa-centro',
    name: 'Monolocale Centro Storico',
    type: 'alloggio',
    coordinates: [9.405, 41.213], 
    description: 'Nel cuore pulsante della Maddalena, tra carruggi e storia.',
    maddiTip: 'Perfetto se ami uscire a piedi la sera. Sei a due passi dal porto per il Veliero Francesca!'
  },
  {
    id: 'casa-tegge',
    name: 'Attico Vista Tegge',
    type: 'alloggio',
    coordinates: [9.388, 41.214],
    description: 'Vista mozzafiato sulle scogliere e tramonti indimenticabili.',
    maddiTip: 'Prepara la fotocamera: da qui vedrai i tramonti più belli dell’arcipelago.'
  },
  {
    id: 'casa-giardino',
    name: 'Villetta con Giardino Privato',
    type: 'alloggio',
    coordinates: [9.391, 41.214],
    description: 'Oasi di pace immersa nel verde della macchia mediterranea.',
    maddiTip: 'Il posto ideale per rilassarsi dopo un trekking con Eleonora.'
  },

  // --- RISTORANTI ---
  {
    id: 'vecchia-ilva',
    name: 'La Vecchia Ilva',
    type: 'ristorante',
    coordinates: [9.406, 41.213],
    description: 'Cucina tipica e ottima pizza nel centro.',
    maddiTip: 'Ideale per una cena informale ma di alta qualità dopo una giornata di mare.'
  },
  {
    id: 'aragosta',
    name: 'L’Aragosta',
    type: 'ristorante',
    coordinates: [9.408, 41.214],
    description: 'Ristorante storico con terrazza vista mare.',
    maddiTip: 'Per una serata speciale. Chiedi il pescato del giorno, non sbagliano mai.'
  },
  {
    id: 'zi-anto',
    name: 'Zi Antò',
    type: 'ristorante',
    coordinates: [9.385, 41.212],
    description: 'Posizione unica sugli scogli di Punta Tegge.',
    maddiTip: 'Mangiare qui mentre il sole scende è un’esperienza magica. Prenota in anticipo!'
  }
];