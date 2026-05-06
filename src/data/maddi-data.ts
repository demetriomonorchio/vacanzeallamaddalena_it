// src/data/maddi-data.ts

export type LocationType = 'alloggio' | 'ristorante' | 'esperienza' | 'punto-foto';

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  coordinates: [number, number]; // [Longitudine, Latitudine]
  description: string;
  maddiTip: string; // Il consiglio personalizzato di Maddì
  isFavorite: boolean;
  maddiNote?: string;
  image?: string;
  bookingUrl?: string;
}

export const MADDI_LOCATIONS: Location[] = [
  // --- I TUOI ALLOGGI ---
  {
    id: 'casa-centro',
    name: 'Madda',
    type: 'alloggio',
    coordinates: [9.405, 41.213], 
    description: 'Nel cuore pulsante della Maddalena, tra carruggi e storia.',
    maddiTip: 'Perfetto se ami uscire a piedi la sera. Sei a due passi dal porto per il Veliero Francesca!',
    isFavorite: true,
    maddiNote: 'Scelta ideale se vuoi vivere il centro a piedi senza usare l’auto.',
    bookingUrl: 'https://www.vacanzemaddalena.com/it/appartamenti/madda/'
  },
  {
    id: 'casa-tegge',
    name: 'Isola',
    type: 'alloggio',
    coordinates: [9.388, 41.214],
    description: 'Vista mozzafiato sulle scogliere e tramonti indimenticabili.',
    maddiTip: 'Prepara la fotocamera: da qui vedrai i tramonti più belli dell’arcipelago.',
    isFavorite: true,
    maddiNote: 'Uno dei miei preferiti per panorama e atmosfera al tramonto.',
    bookingUrl: 'https://www.vacanzemaddalena.com/it/appartamenti/isola/'
  },
  {
    id: 'casa-giardino',
    name: 'Lena',
    type: 'alloggio',
    coordinates: [9.391, 41.214],
    description: 'Oasi di pace immersa nel verde della macchia mediterranea.',
    maddiTip: 'Il posto ideale per rilassarsi.',
    isFavorite: true,
    maddiNote: 'Perfetta se cerchi tranquillita e verde, senza rinunciare alla vicinanza al mare.',
    bookingUrl: 'https://www.vacanzemaddalena.com/it/appartamenti/lena/'
  }

  
 
];